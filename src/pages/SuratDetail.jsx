import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { StatusBadge, LoadingSkeleton, Toast } from '../components/UI';
import { ArrowLeft, FileText, Clock, CheckCircle, Send, Download, MessageCircle, Trash2 } from 'lucide-react';

export default function SuratDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [surat, setSurat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [komentar, setKomentar] = useState([]);
  const [komentarLoading, setKomentarLoading] = useState(false);
  const [komentarText, setKomentarText] = useState('');
  const [komentarSubmitting, setKomentarSubmitting] = useState(false);

  const fetchSurat = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSuratById(id);
      setSurat(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat detail surat');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSurat();
  }, [fetchSurat]);

  const fetchKomentar = useCallback(async () => {
    try {
      setKomentarLoading(true);
      const data = await api.getKomentar(id);
      setKomentar(data);
    } catch (err) {
      console.error(err);
    } finally {
      setKomentarLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKomentar();
  }, [fetchKomentar]);

  const handleUpdateStatus = async (newStatus) => {
    setStatusLoading(true);
    try {
      await api.updateStatus({ surat_id: id, status: newStatus, catatan: `Status diubah ke ${newStatus}` });
      setToast({ message: `Status berhasil diubah ke ${newStatus}`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
      fetchSurat();
    } catch (err) {
      setToast({ message: err.message || 'Gagal mengubah status', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddKomentar = async (e) => {
    e.preventDefault();
    if (!komentarText.trim()) return;
    setKomentarSubmitting(true);
    try {
      await api.addKomentar(id, komentarText);
      setKomentarText('');
      fetchKomentar();
    } catch (err) {
      setToast({ message: err.message || 'Gagal menambah komentar', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setKomentarSubmitting(false);
    }
  };

  const handleDownloadFile = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiUrl}/api/surat/${surat.id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDeleteKomentar = async (komentarId) => {
    if (!window.confirm('Hapus komentar ini?')) return;
    try {
      await api.deleteKomentar(komentarId);
      fetchKomentar();
    } catch (err) {
      setToast({ message: err.message || 'Gagal menghapus komentar', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const statusIcons = {
    Diterima: Send,
    Didisposisi: FileText,
    Diproses: Clock,
    Selesai: CheckCircle,
  };

  const statusColors = {
    Diterima: '#1D4ED8',
    Didisposisi: '#D97706',
    Diproses: '#0891B2',
    Selesai: '#16A34A',
  };

  if (loading) return <div><LoadingSkeleton rows={8} cols={2} /></div>;

  if (error) {
    return (
      <div>
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2 mb-4">
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2" style={{ padding: '6px 12px' }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-ds-h1">Detail Surat</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <h2 className="text-ds-h4 mb-4">Informasi Surat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Nomor Surat</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{surat?.nomor_surat}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Status</p>
                <StatusBadge status={surat?.status} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Tanggal Diterima</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{surat?.tanggal_diterima ? new Date(surat.tanggal_diterima).toLocaleDateString('id-ID') : '-'}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Pengirim</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{surat?.pengirim}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm" style={{ color: '#475569' }}>Perihal</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{surat?.perihal}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Dibuat Oleh</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{surat?.pembuat_nama || '-'}</p>
              </div>
              {surat?.file_scan && (
                <div>
                  <p className="text-sm" style={{ color: '#475569' }}>File Scan</p>
                  <button onClick={handleDownloadFile} className="flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: '#1D4ED8' }}>
                    <Download size={14} /> Lihat File
                  </button>
                </div>
              )}
            </div>
          </div>

          {surat?.disposisi?.length > 0 && (
            <div className="card mb-6">
              <h2 className="text-ds-h4 mb-4">Disposisi</h2>
              <div className="space-y-3">
                {surat.disposisi.map((d) => (
                  <Link key={d.id} to={`/disposisi/${d.id}`} className="block p-3 rounded-md hover:bg-blue-50 transition-colors" style={{ border: '1px solid #E2E8F0' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Kepada: {d.penerima_nama}</p>
                        <p className="text-xs mt-1" style={{ color: '#475569' }}>{d.instruksi}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: '#475569' }}>Deadline</p>
                        <p className="text-sm font-medium">{new Date(d.deadline).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="card mb-6">
            <h2 className="text-ds-h4 mb-4 flex items-center gap-2"><MessageCircle size={18} /> Komentar</h2>
            <form onSubmit={handleAddKomentar} className="flex gap-2 mb-4">
              <input
                type="text"
                value={komentarText}
                onChange={(e) => setKomentarText(e.target.value)}
                placeholder="Tulis komentar..."
                className="input-field flex-1"
              />
              <button type="submit" disabled={komentarSubmitting || !komentarText.trim()} className="btn-primary flex items-center gap-1 px-4">
                {komentarSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
              </button>
            </form>
            {komentarLoading ? (
              <p className="text-sm" style={{ color: '#94A3B8' }}>Memuat komentar...</p>
            ) : komentar.length === 0 ? (
              <p className="text-sm" style={{ color: '#94A3B8' }}>Belum ada komentar</p>
            ) : (
              <div className="space-y-3">
                {komentar.map((k) => (
                  <div key={k.id} className="p-3 rounded-md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{k.user_nama}</span>
                        <span className="text-xs ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>{k.user_role?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: '#94A3B8' }}>{new Date(k.created_at).toLocaleString('id-ID')}</span>
                        {(k.user_id === user?.id || user?.role === 'ADMIN_TU' || user?.role === 'KEPALA_SEKOLAH') && (
                          <button onClick={() => handleDeleteKomentar(k.id)} className="text-xs p-1 rounded hover:bg-red-50" style={{ color: '#DC2626' }}>
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm mt-1" style={{ color: '#334155' }}>{k.isi}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user?.role === 'GURU_STAF' && surat?.status === 'Didisposisi' && (
            <div className="card mb-4">
              <h2 className="text-ds-h4 mb-4">Aksi</h2>
              <button onClick={() => handleUpdateStatus('Diproses')} disabled={statusLoading} className="btn-primary flex items-center gap-2">
                {statusLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={16} />}
                Tindak Lanjut
              </button>
            </div>
          )}

          {user?.role === 'GURU_STAF' && surat?.status === 'Diproses' && (
            <div className="card">
              <h2 className="text-ds-h4 mb-4">Aksi</h2>
              <button onClick={() => handleUpdateStatus('Selesai')} disabled={statusLoading} className="btn-primary flex items-center gap-2">
                {statusLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={16} />}
                Tandai Selesai
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-ds-h4 mb-4">Timeline</h2>
            {surat?.timeline?.length > 0 ? (
              <div className="space-y-4">
                {surat.timeline.map((t, idx) => {
                  const Icon = statusIcons[t.status] || Clock;
                  return (
                    <div key={t.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="p-1.5 rounded-full" style={{ backgroundColor: statusColors[t.status] + '20' }}>
                          <Icon size={14} style={{ color: statusColors[t.status] }} />
                        </div>
                        {idx < surat.timeline.length - 1 && <div className="w-px flex-1 mt-1" style={{ backgroundColor: '#E2E8F0' }} />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{t.status}</p>
                        {t.catatan && <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{t.catatan}</p>}
                        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                          {t.diubah_oleh_nama} · {new Date(t.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#94A3B8' }}>Belum ada riwayat status</p>
            )}
          </div>

          {user?.role === 'KEPALA_SEKOLAH' && surat?.status === 'Diterima' && (
            <div className="card mt-4">
              <Link to={`/disposisi/buat/${id}`} className="btn-primary w-full flex items-center justify-center gap-2">
                <Send size={16} /> Buat Disposisi
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
