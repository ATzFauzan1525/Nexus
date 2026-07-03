import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { StatusBadge, LoadingSkeleton, RealtimeHighlight } from '../components/UI';
import LacakWidget from '../components/LacakWidget';
import PosisiSurat from '../components/PosisiSurat';
import { Mail, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { user, socket } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSurat, setRecentSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchDashboard = useCallback(async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        api.getStats(),
        api.getSurat({ limit: 5 }).catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.stats);
      setRecentSurat(statsRes.recentSurat?.length ? statsRes.recentSurat : recentRes.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, refreshKey]);

  useEffect(() => {
    if (socket) {
      const handleRefresh = () => setRefreshKey((k) => k + 1);
      socket.on('dashboard:refresh', handleRefresh);
      socket.on('surat:baru', handleRefresh);
      return () => {
        socket.off('dashboard:refresh', handleRefresh);
        socket.off('surat:baru', handleRefresh);
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div>
        <h1 className="text-ds-h1 mb-6">Dashboard</h1>
        <div className="grid grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-neutral-200 rounded w-1/3" />
            </div>
          ))}
        </div>
        <LoadingSkeleton rows={5} cols={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-ds-h1 mb-6">Dashboard</h1>
        <div className="px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
          <button onClick={() => { setError(''); setLoading(true); fetchDashboard(); }} className="ml-3 underline font-medium">Coba Lagi</button>
        </div>
      </div>
    );
  }

  const isGuruStaf = user?.role === 'GURU_STAF';

  const statCards = [
    { label: isGuruStaf ? 'Disposisi Hari Ini' : 'Surat Hari Ini', value: stats?.total_hari_ini || 0, icon: Mail, color: '#1D4ED8', bg: '#EFF6FF' },
    { label: isGuruStaf ? 'Belum Selesai' : 'Belum Selesai', value: stats?.belum_selesai || 0, icon: Clock, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2' },
    { label: isGuruStaf ? 'Total Disposisi' : 'Total Semua', value: stats?.total_semua || 0, icon: FileText, color: '#16A34A', bg: '#DCFCE7' },
  ];

  return (
    <div>
      <h1 className="text-ds-h1 mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="card flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: card.bg }}>
                <Icon size={24} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {(user?.role === 'ADMIN_TU' || user?.role === 'KEPALA_SEKOLAH' || user?.role === 'WAKASEK') && (
        <div className="mb-8">
          <PosisiSurat socket={socket} />
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-ds-h3">{isGuruStaf ? 'Disposisi Terbaru' : 'Surat Terbaru'}</h2>
          {!isGuruStaf && <Link to="/surat" className="text-sm font-medium hover:underline" style={{ color: '#1D4ED8' }}>Lihat Semua</Link>}
          {isGuruStaf && <Link to="/disposisi/saya" className="text-sm font-medium hover:underline" style={{ color: '#1D4ED8' }}>Lihat Semua</Link>}
        </div>
        {recentSurat.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#94A3B8' }}>
            <p>Belum ada surat masuk</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Nomor Surat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Pengirim</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Perihal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentSurat.map((surat, idx) => (
                <tr key={surat.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td className="px-4 py-3">
                    <Link to={`/surat/${surat.id}`} className="text-sm font-medium hover:underline" style={{ color: '#1D4ED8' }}>{surat.nomor_surat}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#334155' }}>{surat.pengirim}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#334155' }}>{surat.perihal}</td>
                  <td className="px-4 py-3"><StatusBadge status={surat.status} /></td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>{new Date(surat.tanggal_diterima).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
