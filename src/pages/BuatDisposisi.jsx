import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { LoadingSkeleton, Toast } from '../components/UI';
import { ArrowLeft, Download } from 'lucide-react';

export default function BuatDisposisiPage() {
  const { idSurat } = useParams();
  const navigate = useNavigate();
  const [surat, setSurat] = useState(null);
  const [guruStaf, setGuruStaf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    diberikan_kepada: '',
    instruksi: '',
    deadline: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [suratData, guruData] = await Promise.all([
        api.getSuratById(idSurat),
        api.getGuruStaf(),
      ]);
      setSurat(suratData);
      setGuruStaf(guruData);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [idSurat]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadFile = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`/api/surat/${idSurat}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.createDisposisi({
        surat_id: idSurat,
        diberikan_kepada: form.diberikan_kepada,
        instruksi: form.instruksi,
        deadline: form.deadline,
      });
      setToast({ message: 'Disposisi berhasil dibuat', type: 'success' });
      setTimeout(() => navigate(`/surat/${idSurat}`), 1500);
    } catch (err) {
      setError(err.message || 'Gagal membuat disposisi');
      setToast({ message: err.message || 'Gagal membuat disposisi', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div><LoadingSkeleton rows={6} cols={2} /></div>;

  return (
    <div style={{ maxWidth: '640px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2" style={{ padding: '6px 12px' }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-ds-h1">Buat Disposisi</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
        </div>
      )}

      {surat && (
        <div className="card mb-6">
          <h2 className="text-ds-h4 mb-3">Informasi Surat</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm" style={{ color: '#475569' }}>Nomor Surat</p>
              <p className="font-medium" style={{ color: '#0F172A' }}>{surat.nomor_surat}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: '#475569' }}>Pengirim</p>
              <p className="font-medium" style={{ color: '#0F172A' }}>{surat.pengirim}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm" style={{ color: '#475569' }}>Perihal</p>
              <p className="font-medium" style={{ color: '#0F172A' }}>{surat.perihal}</p>
            </div>
            {surat.file_scan && (
              <div>
                <p className="text-sm" style={{ color: '#475569' }}>File Scan</p>
                <button onClick={handleDownloadFile} className="flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: '#1D4ED8' }}>
                  <Download size={14} /> Lihat File
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-ds-h4 mb-4">Form Disposisi</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Penerima Disposisi *</label>
            <select name="diberikan_kepada" value={form.diberikan_kepada} onChange={handleChange} className="input-field w-full" required>
              <option value="">Pilih penerima...</option>
              {guruStaf.map((g) => (
                <option key={g.id} value={g.id}>{g.nama_lengkap} ({g.bidang || 'Guru/Staf'})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Instruksi *</label>
            <textarea name="instruksi" value={form.instruksi} onChange={handleChange} className="input-field w-full" rows={4} placeholder="Tuliskan instruksi disposisi..." required />
          </div>
          <div>
            <label className="label-field">Deadline *</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="input-field w-full" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</>) : 'Buat Disposisi'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
