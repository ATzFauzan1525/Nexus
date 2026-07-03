import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { StatusBadge, LoadingSkeleton } from './UI';
import { MapPin } from 'lucide-react';

export default function PosisiSurat({ socket }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('semua');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getPosisiAll();
      setData(result);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat data posisi surat');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (socket) {
      const handleRefresh = () => fetchData();
      socket.on('status:update', handleRefresh);
      socket.on('surat:baru', handleRefresh);
      socket.on('disposisi:baru', handleRefresh);
      socket.on('dashboard:refresh', handleRefresh);
      return () => {
        socket.off('status:update', handleRefresh);
        socket.off('surat:baru', handleRefresh);
        socket.off('disposisi:baru', handleRefresh);
        socket.off('dashboard:refresh', handleRefresh);
      };
    }
  }, [socket, fetchData]);

  const filtered = filter === 'semua'
    ? data
    : data.filter((s) => {
        if (filter === 'diterima') return s.status === 'Diterima';
        if (filter === 'diproses') return s.status === 'Didisposisi' || s.status === 'Diproses';
        if (filter === 'selesai') return s.status === 'Selesai';
        return true;
      });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={20} style={{ color: '#1D4ED8' }} />
          <h2 className="text-ds-h4">Posisi Surat</h2>
          {data.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
              {data.length}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {[
            { value: 'semua', label: 'Semua' },
            { value: 'diterima', label: 'Diterima' },
            { value: 'diproses', label: 'Diproses' },
            { value: 'selesai', label: 'Selesai' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: filter === f.value ? '#1D4ED8' : '#F1F5F9',
                color: filter === f.value ? '#FFFFFF' : '#475569',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-md text-sm mb-3" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton rows={4} cols={5} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-8" style={{ color: '#94A3B8' }}>
          <p className="text-sm">Tidak ada surat</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase" style={{ color: '#475569' }}>No. Surat</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase" style={{ color: '#475569' }}>Perihal</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase" style={{ color: '#475569' }}>Status</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase" style={{ color: '#475569' }}>Posisi Saat Ini</th>
                <th className="text-left px-3 py-2 text-xs font-semibold uppercase" style={{ color: '#475569' }}>Disposisi Kepada</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td className="px-3 py-2">
                    <Link to={`/surat/${s.id}`} className="text-sm font-medium hover:underline" style={{ color: '#1D4ED8' }}>{s.nomor_surat}</Link>
                  </td>
                  <td className="px-3 py-2 text-sm truncate max-w-[180px]" style={{ color: '#334155' }} title={s.perihal}>{s.perihal}</td>
                  <td className="px-3 py-2"><StatusBadge status={s.status} /></td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      {s.status !== 'Selesai' && s.status !== 'Diterima' && (
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#16A34A' }} />
                      )}
                      <span className="text-sm font-medium" style={{ color: s.status === 'Selesai' ? '#16A34A' : s.status === 'Diterima' ? '#D97706' : '#0F172A' }}>
                        {s.posisi_saat_ini}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm" style={{ color: '#475569' }}>
                    {s.penerima_nama ? `${s.penerima_nama} (${s.penerima_bidang || '-'})` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
