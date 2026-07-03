import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { StatusBadge, LoadingSkeleton, EmptyState } from '../components/UI';
import { ClipboardList, Clock, CheckCircle, AlertTriangle, Inbox, PenLine } from 'lucide-react';

export default function DisposisiKepalaPage() {
  const { user, socket } = useAuth();
  const [disposisi, setDisposisi] = useState([]);
  const [suratPending, setSuratPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const limit = 20;

  const fetchDisposisi = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDisposisi({ page, limit });
      setDisposisi(data.data);
      setTotal(data.total);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat data disposisi');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchSuratPending = useCallback(async () => {
    try {
      setLoadingPending(true);
      const data = await api.getSurat({ status: 'Diterima', page: 1, limit: 50 });
      setSuratPending(data.data);
    } catch {
      // optional
    } finally {
      setLoadingPending(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data.stats);
    } catch {
      // stats optional
    }
  }, []);

  useEffect(() => {
    fetchDisposisi();
    fetchSuratPending();
    fetchStats();
  }, [fetchDisposisi, fetchSuratPending, fetchStats]);

  useEffect(() => {
    if (socket) {
      const handleRefresh = () => { fetchDisposisi(); fetchSuratPending(); fetchStats(); };
      socket.on('disposisi:baru', handleRefresh);
      socket.on('status:update', handleRefresh);
      socket.on('surat:baru', handleRefresh);
      return () => {
        socket.off('disposisi:baru', handleRefresh);
        socket.off('status:update', handleRefresh);
        socket.off('surat:baru', handleRefresh);
      };
    }
  }, [socket, fetchDisposisi, fetchSuratPending, fetchStats]);

  const totalPages = Math.ceil(total / limit);

  const overdueCount = disposisi.filter((d) => new Date(d.deadline) < new Date() && d.surat_status !== 'Selesai').length;
  const selesaiCount = disposisi.filter((d) => d.surat_status === 'Selesai').length;
  const pendingCount = disposisi.filter((d) => d.surat_status === 'Didisposisi' || d.surat_status === 'Diproses').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-ds-h1">Disposisi</h1>
        <p className="text-sm" style={{ color: '#475569' }}>Kelola disposisi surat yang Anda buat</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
          <button onClick={fetchDisposisi} className="ml-3 underline font-medium">Coba Lagi</button>
        </div>
      )}

      {/* Surat Belum Didisposisi */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Inbox size={20} style={{ color: '#D97706' }} />
            <h2 className="text-ds-h4">Surat Belum Didisposisi</h2>
            {suratPending.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                {suratPending.length}
              </span>
            )}
          </div>
        </div>

        {loadingPending ? (
          <LoadingSkeleton rows={3} cols={4} />
        ) : suratPending.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle size={32} className="mx-auto mb-2" style={{ color: '#16A34A' }} />
            <p className="text-sm" style={{ color: '#475569' }}>Semua surat sudah didisposisi</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Nomor Surat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Pengirim</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Perihal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Tanggal Diterima</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {suratPending.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td className="px-4 py-3">
                    <Link to={`/surat/${s.id}`} className="text-sm font-medium hover:underline" style={{ color: '#1D4ED8' }}>{s.nomor_surat}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#334155' }}>{s.pengirim}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#334155' }}>{s.perihal}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>{new Date(s.tanggal_diterima).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/disposisi/buat/${s.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors"
                      style={{ backgroundColor: '#1D4ED8' }}
                    >
                      <PenLine size={14} /> Disposisi
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
