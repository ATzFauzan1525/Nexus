import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { StatusBadge, LoadingSkeleton, EmptyState } from '../components/UI';
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DisposisiListPage() {
  const { user, socket } = useAuth();
  const [disposisi, setDisposisi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
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

  useEffect(() => {
    fetchDisposisi();
  }, [fetchDisposisi]);

  useEffect(() => {
    if (socket) {
      const handleRefresh = () => fetchDisposisi();
      socket.on('disposisi:baru', handleRefresh);
      socket.on('status:update', handleRefresh);
      return () => {
        socket.off('disposisi:baru', handleRefresh);
        socket.off('status:update', handleRefresh);
      };
    }
  }, [socket, fetchDisposisi]);

  const totalPages = Math.ceil(total / limit);

  const overdueCount = disposisi.filter((d) => new Date(d.deadline) < new Date() && d.surat_status !== 'Selesai').length;
  const selesaiCount = disposisi.filter((d) => d.surat_status === 'Selesai').length;
  const pendingCount = disposisi.filter((d) => d.surat_status === 'Didisposisi' || d.surat_status === 'Diproses').length;

  return (
    <div>
      <h1 className="text-ds-h1 mb-6">Riwayat Disposisi</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
          <button onClick={fetchDisposisi} className="ml-3 underline font-medium">Coba Lagi</button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
            <ClipboardList size={20} style={{ color: '#1D4ED8' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: '#475569' }}>Total</p>
            <p className="text-lg font-bold" style={{ color: '#0F172A' }}>{total}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
            <Clock size={20} style={{ color: '#D97706' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: '#475569' }}>Dalam Proses</p>
            <p className="text-lg font-bold" style={{ color: '#0F172A' }}>{pendingCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
            <CheckCircle size={20} style={{ color: '#16A34A' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: '#475569' }}>Selesai</p>
            <p className="text-lg font-bold" style={{ color: '#0F172A' }}>{selesaiCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
            <AlertTriangle size={20} style={{ color: '#DC2626' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: '#475569' }}>Overdue</p>
            <p className="text-lg font-bold" style={{ color: '#DC2626' }}>{overdueCount}</p>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} cols={5} />
        ) : disposisi.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={48} />}
            title="Belum Ada Disposisi"
            description="Belum ada disposisi yang tercatat."
          />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Nomor Surat</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Perihal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Penerima</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Deadline</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Status Surat</th>
                </tr>
              </thead>
              <tbody>
                {disposisi.map((d, idx) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                    <td className="px-4 py-3">
                      <Link to={`/disposisi/${d.id}`} className="text-sm font-medium hover:underline" style={{ color: '#1D4ED8' }}>{d.nomor_surat}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#334155' }}>{d.perihal}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#334155' }}>{d.penerima_nama}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>{new Date(d.deadline).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.surat_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid #E2E8F0' }}>
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
