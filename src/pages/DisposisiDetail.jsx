import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { StatusBadge, LoadingSkeleton, Toast, Modal } from '../components/UI';
import { ArrowLeft, Clock, CheckCircle, Download } from 'lucide-react';

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

  const openStatusModal = (targetStatus) => {
    setStatusModal({ open: true, targetStatus });
    setCatatan('');
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
    <div style={{ maxWidth: '720px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2" style={{ padding: '6px 12px' }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-ds-h1">Detail Disposisi</h1>
      </div>

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

      {user?.role !== 'GURU_STAF' && disposisi?.status_terakhir?.catatan && disposisi?.surat_status === 'Selesai' && (
        <div className="card mb-6">
          <h2 className="text-ds-h4 mb-3">Catatan Penyelesaian</h2>
          <div className="p-3 rounded-md" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} style={{ color: '#16A34A' }} />
              <span className="text-sm font-medium" style={{ color: '#16A34A' }}>
                {disposisi.status_terakhir.status} oleh {disposisi.status_terakhir.pengubah_nama}
              </span>
              <span className="text-xs" style={{ color: '#94A3B8' }}>
                {new Date(disposisi.status_terakhir.created_at).toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#334155' }}>{disposisi.status_terakhir.catatan}</p>
          </div>
        </div>
      )}

      {user?.role === 'GURU_STAF' && disposisi?.surat_status !== 'Selesai' && (
        <div className="card">
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
