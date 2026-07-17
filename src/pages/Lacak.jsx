import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { StatusBadge } from '../components/UI';
import { Search, MapPin, FileText, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function LacakPage() {
  const [nomorSurat, setNomorSurat] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const socketRef = useRef(null);
  const currentRoomRef = useRef('');

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!nomorSurat.trim()) return;

    setLoading(true);
    setError('');
    setNotFound(false);
    setResult(null);

    try {
      const data = await api.trackSurat(nomorSurat.trim());
      setResult(data);

      // Connect socket for realtime updates on this tracking page
      if (!socketRef.current) {
        const newSocket = io(import.meta.env.VITE_API_URL || window.location.origin, {
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          auth: { isPublic: true },
        });

        newSocket.on('connect', () => {
          newSocket.emit('lacak:join', nomorSurat.trim());
          currentRoomRef.current = nomorSurat.trim();
        });

        newSocket.on('lacak:update', (updateData) => {
          setResult((prev) => prev ? { ...prev, ...updateData } : prev);
        });

        socketRef.current = newSocket;
      } else {
        // Leave old room before joining new one
        if (currentRoomRef.current) {
          socketRef.current.emit('lacak:leave', currentRoomRef.current);
        }
        socketRef.current.emit('lacak:join', nomorSurat.trim());
        currentRoomRef.current = nomorSurat.trim();
      }
    } catch (err) {
      if (err.message.includes('tidak ditemukan')) {
        setNotFound(true);
      } else {
        setError(err.message || 'Terjadi kesalahan');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Public Header */}
      <header className="py-4 px-6" style={{ backgroundColor: '#1D4ED8' }}>
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">SiDis</h1>
          <span className="text-sm text-white" style={{ opacity: 0.8 }}>SMP Muhammadiyah 9 Yogyakarta</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-ds-h1 mb-2" style={{ color: '#0F172A' }}>Lacak Status Surat</h2>
          <img src="/logo.png" alt="Logo SMP Muhammadiyah 9 YK" className="mx-auto mt-4 h-48 w-48 object-contain" />
          <p className="text-sm mt-4" style={{ color: '#475569' }}>Masukkan nomor surat untuk melacak posisi dan status surat Anda</p>
        </div>

        <div className="w-full" style={{ maxWidth: '480px' }}>
          <form onSubmit={handleTrack} className="card">
            <div className="flex gap-2">
              <input
                type="text"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                placeholder="Masukkan nomor surat..."
                className="input-field flex-1"
                style={{ fontSize: '18px', padding: '14px 16px' }}
              />
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2" style={{ padding: '14px 20px' }}>
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={18} />}
                Cek Status
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
              {error}
            </div>
          )}

          {notFound && (
            <div className="mt-4 card text-center py-8">
              <MapPin size={48} className="mx-auto mb-3" style={{ color: '#94A3B8' }} />
              <p className="text-sm" style={{ color: '#475569' }}>
                Nomor surat tidak ditemukan. Pastikan nomor surat sudah benar.
              </p>
            </div>
          )}

          {result && (
            <div className="mt-4 card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm" style={{ color: '#475569' }}>Nomor Surat</p>
                  <p className="font-bold text-lg" style={{ color: '#0F172A' }}>{result.nomorSurat}</p>
                </div>
                <StatusBadge status={result.status} />
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm" style={{ color: '#475569' }}>Pengirim</p>
                  <p className="font-medium" style={{ color: '#0F172A' }}>{result.pengirim}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#475569' }}>Perihal</p>
                  <p className="font-medium" style={{ color: '#0F172A' }}>{result.perihal}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#475569' }}>Tanggal Diterima</p>
                  <p className="font-medium" style={{ color: '#0F172A' }}>{result.tanggalDiterima ? new Date(result.tanggalDiterima).toLocaleDateString('id-ID') : '-'}</p>
                </div>
              </div>

              <div className="p-3 rounded-md" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#16A34A' }} />
                  <span className="text-xs font-medium" style={{ color: '#16A34A' }}>Live</span>
                </div>
                <p className="text-sm font-medium" style={{ color: '#1D4ED8' }}>Posisi Saat Ini</p>
                <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{result.posisiSaatIni}</p>
              </div>

              {/* Alur Surat */}
              {result.timeline && result.timeline.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-3" style={{ color: '#0F172A' }}>Alur Surat</p>
                  <div className="overflow-x-auto pb-2">
                    <div className="flex items-start" style={{ minWidth: 'fit-content' }}>
                      {(() => {
                        const allSteps = ['Diterima', 'Didisposisi', 'Diproses', 'Selesai'];
                        const statusIcons = {
                          'Diterima': <FileText size={16} />,
                          'Didisposisi': <Users size={16} />,
                          'Diproses': <Clock size={16} />,
                          'Selesai': <CheckCircle size={16} />,
                        };
                        const statusColors = {
                          'Diterima': '#F97316',
                          'Didisposisi': '#D97706',
                          'Diproses': '#2563EB',
                          'Selesai': '#16A34A',
                        };
                        const timelineMap = {};
                        result.timeline.forEach((t) => { timelineMap[t.status] = t; });
                        const currentIdx = allSteps.indexOf(result.status);
                        return allSteps.map((status, idx) => {
                          const isAchieved = timelineMap[status];
                          const isCurrentOrBefore = idx <= currentIdx;
                          const color = statusColors[status];
                          return (
                            <div key={status} className="flex flex-col items-center relative" style={{ minWidth: '120px' }}>
                              <div className="flex items-center">
                                {idx > 0 && (
                                  <div className="absolute top-4 right-1/2 h-0.5" style={{ width: '60px', backgroundColor: isAchieved ? color : '#E2E8F0', transform: 'translateX(50%)' }} />
                                )}
                                <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: isAchieved ? color : '#E2E8F0', color: isAchieved ? '#FFFFFF' : '#94A3B8' }}>
                                  {statusIcons[status]}
                                </div>
                              </div>
                              <p className="text-xs font-medium mt-2 text-center" style={{ color: isAchieved ? '#0F172A' : '#94A3B8', maxWidth: '100px' }}>
                                {status}
                              </p>
                              {isAchieved ? (
                                <>
                                  {timelineMap[status].diubah_oleh_nama && (
                                    <p className="text-xs text-center font-medium" style={{ color: '#334155', maxWidth: '140px' }}>
                                      {timelineMap[status].diubah_oleh_nama}
                                    </p>
                                  )}
                                  <p className="text-xs text-center" style={{ color: '#94A3B8' }}>
                                    {new Date(timelineMap[status].created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                  </p>
                                </>
                              ) : (
                                <p className="text-xs text-center" style={{ color: '#94A3B8' }}>Belum</p>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm hover:underline" style={{ color: '#1D4ED8' }}>Masuk ke Sistem →</Link>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="py-4 px-6 text-center" style={{ backgroundColor: '#F1F5F9', borderTop: '1px solid #E2E8F0' }}>
        <p className="text-xs" style={{ color: '#475569' }}>
          &copy; 2026 SMP Muhammadiyah 9 Yogyakarta. Hak Cipta Dilindungi.
        </p>
      </footer>
    </div>
  );
}
