import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { LoadingSkeleton, EmptyState, Toast } from '../components/UI';
import { Bell, Check, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const { user, socket } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const limit = 20;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getNotifikasi({ page, limit });
      setNotifications(data.data);
      setTotal(data.total);
      setUnread(data.unread);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (socket) {
      const handleNew = () => fetchNotifications();
      socket.on('notifikasi:baru', handleNew);
      return () => socket.off('notifikasi:baru', handleNew);
    }
  }, [socket, fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, dibaca: true } : n));
      setUnread((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setToast({ message: 'Gagal menandai notifikasi', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
      setUnread(0);
      setToast({ message: 'Semua notifikasi ditandai sudah dibaca', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ message: 'Gagal menandai semua notifikasi', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.dibaca) {
      handleMarkAsRead(notif.id);
    }
    if (notif.reference_id) {
      if (notif.tipe === 'surat_baru' || notif.tipe === 'status_update') {
        navigate(`/surat/${notif.reference_id}`);
      } else if (notif.tipe === 'disposisi_baru') {
        navigate(`/disposisi/${notif.reference_id}`);
      }
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-ds-h1">Notifikasi</h1>
          {unread > 0 && <p className="text-sm mt-1" style={{ color: '#475569' }}>{unread} notifikasi belum dibaca</p>}
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2">
            <CheckCheck size={16} /> Tandai Semua Dibaca
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
          <button onClick={fetchNotifications} className="ml-3 underline font-medium">Coba Lagi</button>
        </div>
      )}

      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} cols={2} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={48} />}
            title="Tidak Ada Notifikasi"
            description="Anda belum memiliki notifikasi."
          />
        ) : (
          <>
            <div className="divide-y" style={{ borderColor: '#E2E8F0' }}>
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className="w-full text-left p-4 hover:bg-blue-50 transition-colors flex items-start gap-3"
                  style={{
                    backgroundColor: !notif.dibaca ? '#EFF6FF' : undefined,
                    borderBottom: '1px solid #E2E8F0',
                  }}
                >
                  <div className="mt-1">
                    {!notif.dibaca ? (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#1D4ED8' }} />
                    ) : (
                      <Check size={14} style={{ color: '#94A3B8' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{notif.judul}</p>
                    <p className="text-sm mt-0.5" style={{ color: '#475569' }}>{notif.pesan}</p>
                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{new Date(notif.created_at).toLocaleString('id-ID')}</p>
                  </div>
                </button>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4" style={{ borderTop: '1px solid #E2E8F0' }}>
                <p className="text-sm" style={{ color: '#475569' }}>Halaman {page} dari {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm" style={{ padding: '6px 12px' }}>Sebelumnya</button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm" style={{ padding: '6px 12px' }}>Selanjutnya</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
