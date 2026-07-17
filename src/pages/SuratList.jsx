import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { StatusBadge, LoadingSkeleton, EmptyState } from '../components/UI';
import { Search, Plus, Inbox, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function SuratListPage() {
  const { user, socket } = useAuth();
  const [surat, setSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advanced, setAdvanced] = useState({ tanggal_mulai: '', tanggal_akhir: '', pengirim: '', perihal: '' });
  const limit = 20;

  const fetchSurat = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (advanced.tanggal_mulai) params.tanggal_mulai = advanced.tanggal_mulai;
      if (advanced.tanggal_akhir) params.tanggal_akhir = advanced.tanggal_akhir;
      if (advanced.pengirim) params.pengirim = advanced.pengirim;
      if (advanced.perihal) params.perihal = advanced.perihal;
      const data = await api.getSurat(params);
      setSurat(data.data);
      setTotal(data.total);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat data surat');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, advanced]);

  useEffect(() => {
    fetchSurat();
  }, [fetchSurat]);

  useEffect(() => {
    if (socket) {
      const handleRefresh = () => fetchSurat();
      socket.on('surat:baru', handleRefresh);
      socket.on('status:update', handleRefresh);
      return () => {
        socket.off('surat:baru', handleRefresh);
        socket.off('status:update', handleRefresh);
      };
    }
  }, [socket, fetchSurat]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-ds-h1">Daftar Surat Masuk</h1>
        {user?.role === 'ADMIN_TU' && (
          <Link to="/surat/tambah" className="btn-primary flex items-center justify-center gap-2">
            <Plus size={16} />
            Input Surat Baru
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
          <button onClick={fetchSurat} className="ml-3 underline font-medium">Coba Lagi</button>
        </div>
      )}

      <div className="card mb-6">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Cari nomor surat, pengirim, atau perihal..."
                className="input-field pl-10 w-full"
              />
            </div>
            <button type="submit" className="btn-primary px-4">Cari</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field flex-1 sm:flex-none" style={{ minWidth: '120px' }}>
              <option value="">Semua Status</option>
              <option value="Diterima">Diterima</option>
              <option value="Didisposisi">Didisposisi</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="btn-secondary flex items-center gap-1">
              <Filter size={14} /> <span className="hidden sm:inline">Filter</span> {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </form>
        {showAdvanced && (
          <div className="mt-4 pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3" style={{ borderTop: '1px solid #E2E8F0' }}>
            <div>
              <label className="label-field">Tanggal Mulai</label>
              <input type="date" value={advanced.tanggal_mulai} onChange={(e) => setAdvanced({ ...advanced, tanggal_mulai: e.target.value })} className="input-field w-full" />
            </div>
            <div>
              <label className="label-field">Tanggal Akhir</label>
              <input type="date" value={advanced.tanggal_akhir} onChange={(e) => setAdvanced({ ...advanced, tanggal_akhir: e.target.value })} className="input-field w-full" />
            </div>
            <div>
              <label className="label-field">Pengirim</label>
              <input type="text" value={advanced.pengirim} onChange={(e) => setAdvanced({ ...advanced, pengirim: e.target.value })} placeholder="Nama pengirim..." className="input-field w-full" />
            </div>
            <div>
              <label className="label-field">Perihal</label>
              <input type="text" value={advanced.perihal} onChange={(e) => setAdvanced({ ...advanced, perihal: e.target.value })} placeholder="Perihal surat..." className="input-field w-full" />
            </div>
          </div>
        )}
      </div>

      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} cols={5} />
        ) : surat.length === 0 ? (
          <EmptyState
            icon={<Inbox size={48} />}
            title="Belum Ada Surat Masuk"
            description="Belum ada surat yang tercatat dalam sistem."
            action={user?.role === 'ADMIN_TU' ? <Link to="/surat/tambah" className="btn-primary">Input Surat Pertama</Link> : null}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '500px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                    <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Nomor Surat</th>
                    <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase hidden sm:table-cell" style={{ color: '#475569', letterSpacing: '0.05em' }}>Tanggal</th>
                    <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase hidden md:table-cell" style={{ color: '#475569', letterSpacing: '0.05em' }}>Pengirim</th>
                    <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Perihal</th>
                    <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {surat.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-blue-50 cursor-pointer" style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        <Link to={`/surat/${s.id}`} className="text-sm font-medium hover:underline" style={{ color: '#1D4ED8' }}>{s.nomor_surat}</Link>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-sm hidden sm:table-cell" style={{ color: '#475569' }}>{new Date(s.tanggal_diterima).toLocaleDateString('id-ID')}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-sm hidden md:table-cell" style={{ color: '#334155' }}>{s.pengirim}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-sm truncate max-w-[120px] md:max-w-none" style={{ color: '#334155' }}>{s.perihal}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4" style={{ borderTop: '1px solid #E2E8F0' }}>
                <p className="text-sm" style={{ color: '#475569' }}>Halaman {page} dari {totalPages} ({total} surat)</p>
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
