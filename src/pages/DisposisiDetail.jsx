import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { StatusBadge, LoadingSkeleton, Toast, Modal } from '../components/UI';
import { ArrowLeft, Clock, CheckCircle, Download, Send, MessageCircle, Trash2, FileText } from 'lucide-react';

export default function DisposisiDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [disposisi, setDisposisi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, targetStatus: '' });
  const [catatan, setCatatan] = useState('');
  const [komentar, setKomentar] = useState([]);
  const [komentarLoading, setKomentarLoading] = useState(false);
  const [komentarText, setKomentarText] = useState('');
  const [komentarSubmitting, setKomentarSubmitting] = useState(false);

  const fetchDisposisi = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDisposisiById(id);
      setDisposisi(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat detail disposisi');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDisposisi();
  }, [fetchDisposisi]);

  const fetchKomentar = useCallback(async () => {
    if (!disposisi?.surat_id) return;
    try {
      setKomentarLoading(true);
      const data = await api.getKomentar(disposisi.surat_id);
      setKomentar(data);
    } catch (err) {
      console.error(err);
    } finally {
      setKomentarLoading(false);
    }
  }, [disposisi?.surat_id]);

  useEffect(() => {
    fetchKomentar();
  }, [fetchKomentar]);

  const handleDownloadFile = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiUrl}/api/surat/${disposisi.surat_id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleUpdateStatus = async (newStatus, catatanText) => {
    setStatusLoading(true);
    try {
      await api.updateStatus({ surat_id: disposisi.surat_id, status: newStatus, catatan: catatanText || '' });
      setToast({ message: `Status berhasil diubah ke ${newStatus}`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
      setStatusModal({ open: false, targetStatus: '' });
      setCatatan('');
      fetchDisposisi();
    } catch (err) {
      setToast({ message: err.message || 'Gagal mengubah status', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddKomentar = async (e) => {
    e.preventDefault();
    if (!komentarText.trim() || !disposisi?.surat_id) return;
    setKomentarSubmitting(true);
    try {
      await api.addKomentar(disposisi.surat_id, komentarText);
      setKomentarText('');
      fetchKomentar();
    } catch (err) {
      setToast({ message: err.message || 'Gagal menambah komentar', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setKomentarSubmitting(false);
    }
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

  const openStatusModal = (targetStatus) => {
    setStatusModal({ open: true, targetStatus });
    setCatatan('');
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

  if (loading) return <div><LoadingSkeleton rows={6} cols={2} /></div>;

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

  const isOverdue = disposisi?.deadline && new Date(disposisi.deadline) < new Date() && disposisi?.surat_status !== 'Selesai';

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2" style={{ padding: '6px 12px' }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-ds-h1">Detail Disposisi</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-ds-h4">Informasi Disposisi</h2>
              <StatusBadge status={disposisi?.surat_status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Nomor Surat</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{disposisi?.nomor_surat}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Perihal</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{disposisi?.perihal}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Pengirim Surat</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{disposisi?.pengirim}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Tanggal Diterima</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{disposisi?.tanggal_diterima ? new Date(disposisi.tanggal_diterima).toLocaleDateString('id-ID') : '-'}</p>
              </div>
              {disposisi?.file_scan && (
                <div>
                  <p className="text-sm" style={{ color: '#475569' }}>File Scan</p>
                  <button onClick={handleDownloadFile} className="flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: '#1D4ED8' }}>
                    <Download size={14} /> Lihat File
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card mb-6">
            <h2 className="text-ds-h4 mb-4">Instruksi Disposisi</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Diberikan Oleh</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{disposisi?.pemberi_nama}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Diberikan Kepada</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{disposisi?.penerima_nama} ({disposisi?.penerima_bidang || 'Guru/Staf'})</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Deadline</p>
                <p className={`font-medium ${isOverdue ? 'font-bold' : ''}`} style={{ color: isOverdue ? '#DC2626' : '#0F172A' }}>
                  {disposisi?.deadline ? new Date(disposisi.deadline).toLocaleDateString('id-ID') : '-'}
                  {isOverdue && <span className="ml-2 text-xs font-normal">(Overdue)</span>}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>Dibuat Pada</p>
                <p className="font-medium" style={{ color: '#0F172A' }}>{disposisi?.created_at ? new Date(disposisi.created_at).toLocaleString('id-ID') : '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: '#475569' }}>Instruksi</p>
              <div className="p-3 rounded-md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <p className="text-sm" style={{ color: '#334155' }}>{disposisi?.instruksi}</p>
              </div>
            </div>
          </div>

          {user?.role === 'GURU_STAF' && disposisi?.surat_status !== 'Selesai' && (
            <div className="card mb-6">
              <h2 className="text-ds-h4 mb-4">Aksi</h2>
              <div className="flex gap-3">
                {disposisi?.surat_status === 'Didisposisi' && (
                  <button onClick={() => openStatusModal('Diproses')} disabled={statusLoading} className="btn-primary flex items-center gap-2">
                    <Clock size={16} /> Mulai Diproses
                  </button>
                )}
                {(disposisi?.surat_status === 'Diproses' || disposisi?.surat_status === 'Didisposisi') && (
                  <button onClick={() => openStatusModal('Selesai')} disabled={statusLoading} className="btn-primary flex items-center gap-2" style={{ backgroundColor: '#16A34A' }}>
                    <CheckCircle size={16} /> Tandai Selesai
                  </button>
                )}
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
        </div>

        <div className="col-span-1">
          <div className="card">
            <h2 className="text-ds-h4 mb-4">Timeline</h2>
            {disposisi?.timeline?.length > 0 ? (
              <div className="space-y-4">
                {disposisi.timeline.map((t, idx) => {
                  const Icon = statusIcons[t.status] || Clock;
                  return (
                    <div key={t.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="p-1.5 rounded-full" style={{ backgroundColor: statusColors[t.status] + '20' }}>
                          <Icon size={14} style={{ color: statusColors[t.status] }} />
                        </div>
                        {idx < disposisi.timeline.length - 1 && <div className="w-px flex-1 mt-1" style={{ backgroundColor: '#E2E8F0' }} />}
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
        </div>
      </div>

      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, targetStatus: '' })}
        title={`Ubah Status ke "${statusModal.targetStatus}"`}
        footer={
          <>
            <button onClick={() => setStatusModal({ open: false, targetStatus: '' })} className="btn-secondary">Batal</button>
            <button onClick={() => handleUpdateStatus(statusModal.targetStatus, catatan)} disabled={statusLoading} className="btn-primary flex items-center gap-2">
              {statusLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Simpan
            </button>
          </>
        }
      >
        <div>
          <label className="label-field">Catatan Tindak Lanjut (opsional)</label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="input-field w-full"
            rows={4}
            placeholder="Tuliskan catatan tindak lanjut..."
          />
          <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>Catatan akan muncul di timeline riwayat surat.</p>
        </div>
      </Modal>
    </div>
  );
}
