import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut } from 'lucide-react';
import api from '../lib/api';

export default function Topbar() {
  const { user, logout, socket, socketStatus } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [reconnectToast, setReconnectToast] = useState(false);
  const [bellBounce, setBellBounce] = useState(false);
  const prevStatus = useRef(socketStatus);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  useEffect(() => { fetchUnreadCount(); }, [fetchUnreadCount]);

  useEffect(() => {
    if (socket) {
      socket.on('notifikasi:baru', (data) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [data, ...prev].slice(0, 5));
        setBellBounce(true);
        setTimeout(() => setBellBounce(false), 500);
      });
      return () => socket.off('notifikasi:baru');
    }
  }, [socket]);

  useEffect(() => {
    if (prevStatus.current !== 'connected' && socketStatus === 'connected' && prevStatus.current !== 'disconnected') {
      setReconnectToast(true);
      setTimeout(() => setReconnectToast(false), 4000);
    }
    prevStatus.current = socketStatus;
  }, [socketStatus]);

  const handleShowNotifications = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      try {
        const data = await api.getNotifikasi({ limit: 5 });
        setNotifications(data.data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.dibaca) {
      await api.markAsRead(notif.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setShowDropdown(false);
    if (notif.reference_id) {
      if (notif.tipe === 'surat_baru' || notif.tipe === 'status_update') {
        navigate(`/surat/${notif.reference_id}`);
      } else if (notif.tipe === 'disposisi_baru') {
        navigate(`/disposisi/${notif.reference_id}`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statusConfig = {
    connected: { color: '#16A34A', label: 'Tersinkron', pulse: false },
    reconnecting: { color: '#D97706', label: 'Menyambungkan ulang...', pulse: true },
    disconnected: { color: '#DC2626', label: 'Offline', pulse: false },
  };
  const currentStatus = statusConfig[socketStatus] || statusConfig.disconnected;

  return (
    <>
      {reconnectToast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg toast-success">
          <span className="text-sm font-medium">Koneksi tersambung kembali. Data telah diperbarui.</span>
        </div>
      )}
      <header className="h-14 flex items-center justify-between px-6" style={{ backgroundColor: '#1D4ED8' }}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <span className="font-bold text-lg text-white">SiDis</span>
          <span className="text-xs text-white" style={{ opacity: 0.8 }}>SMP Muhammadiyah 9 Yogyakarta</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-white">
            <div className={`rounded-full ${currentStatus.pulse ? 'animate-pulse' : ''}`} style={{ width: '8px', height: '8px', backgroundColor: currentStatus.color }} />
            {currentStatus.label}
          </div>
          <div className="relative">
            <button onClick={handleShowNotifications} className="relative p-2 rounded-md transition-colors text-white">
              <div className={bellBounce ? 'animate-bell-bounce' : ''}><Bell size={20} /></div>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#DC2626' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50" style={{ border: '1px solid #E2E8F0' }}>
                <div className="p-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <h3 className="font-semibold text-sm">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs hover:underline" style={{ color: '#1D4ED8' }}>Tandai Semua Dibaca</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm" style={{ color: '#475569' }}>Tidak ada notifikasi</div>
                  ) : (
                    notifications.map((notif) => (
                      <button key={notif.id} onClick={() => handleNotificationClick(notif)} className="w-full text-left p-3 hover:bg-neutral-50 transition-colors" style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: !notif.dibaca ? '#EFF6FF' : undefined }}>
                        <div className="flex items-start gap-2">
                          {!notif.dibaca && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#1D4ED8' }} />}
                          <div>
                            <p className="text-sm font-medium">{notif.judul}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{notif.pesan}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-2" style={{ borderTop: '1px solid #E2E8F0' }}>
                  <button onClick={() => { setShowDropdown(false); navigate('/notifications'); }} className="w-full text-center text-sm hover:underline py-1" style={{ color: '#1D4ED8' }}>Lihat Semua</button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.nama_lengkap}</p>
              <p className="text-xs text-white" style={{ opacity: 0.8 }}>{user?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-md transition-colors hover:bg-white/20 text-white" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
