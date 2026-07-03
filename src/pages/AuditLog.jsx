import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { LoadingSkeleton } from '../components/UI';
import { History, Search } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ aksi: '', entitas: '' });
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filters.aksi) params.aksi = filters.aksi;
      if (filters.entitas) params.entitas = filters.entitas;
      const data = await api.request(`/audit-log?${new URLSearchParams(params).toString()}`);
      setLogs(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  const aksiColors = {
    CREATE: '#16A34A',
    UPDATE_STATUS: '#D97706',
    DELETE: '#DC2626',
  };

  return (
    <div>
      <h1 className="text-ds-h1 mb-6 flex items-center gap-2"><History size={24} /> Audit Log</h1>

      <div className="card mb-6">
        <div className="flex gap-3">
          <select value={filters.aksi} onChange={(e) => { setFilters({ ...filters, aksi: e.target.value }); setPage(1); }} className="input-field" style={{ width: '160px' }}>
            <option value="">Semua Aksi</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE_STATUS">Update Status</option>
            <option value="DELETE">Delete</option>
          </select>
          <select value={filters.entitas} onChange={(e) => { setFilters({ ...filters, entitas: e.target.value }); setPage(1); }} className="input-field" style={{ width: '160px' }}>
            <option value="">Semua Entitas</option>
            <option value="surat_masuk">Surat Masuk</option>
            <option value="disposisi">Disposisi</option>
            <option value="pengguna">Pengguna</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} cols={5} />
        ) : logs.length === 0 ? (
          <div className="text-center py-8" style={{ color: '#94A3B8' }}>
            <p>Belum ada audit log</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Waktu</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Aksi</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Entitas</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                      <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: '#0F172A' }}>{log.user_nama}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#475569' }}>{log.user_role?.replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: (aksiColors[log.aksi] || '#475569') + '15', color: aksiColors[log.aksi] || '#475569' }}>
                          {log.aksi}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#334155' }}>{log.entitas}</td>
                      <td className="px-4 py-3 text-sm max-w-[300px] truncate" style={{ color: '#475569' }} title={log.detail || ''}>
                        {log.detail || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid #E2E8F0' }}>
                <p className="text-sm" style={{ color: '#475569' }}>Halaman {page} dari {totalPages} ({total} log)</p>
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
