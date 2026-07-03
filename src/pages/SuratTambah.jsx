import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function SuratTambahPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nomor_surat: '',
    tanggal_diterima: new Date().toISOString().split('T')[0],
    pengirim: '',
    perihal: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('nomor_surat', form.nomor_surat);
      formData.append('tanggal_diterima', form.tanggal_diterima);
      formData.append('pengirim', form.pengirim);
      formData.append('perihal', form.perihal);
      if (file) formData.append('file_scan', file);

      await api.createSurat(formData);
      navigate('/surat');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan surat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      <h1 className="text-ds-h1 mb-6">Input Surat Masuk Baru</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Nomor Surat *</label>
            <input type="text" name="nomor_surat" value={form.nomor_surat} onChange={handleChange} className="input-field w-full" placeholder="Contoh: 001/SM9/2024" required />
          </div>
          <div>
            <label className="label-field">Tanggal Diterima *</label>
            <input type="date" name="tanggal_diterima" value={form.tanggal_diterima} onChange={handleChange} className="input-field w-full" required />
          </div>
          <div>
            <label className="label-field">Pengirim *</label>
            <input type="text" name="pengirim" value={form.pengirim} onChange={handleChange} className="input-field w-full" placeholder="Nama pengirim surat" required />
          </div>
          <div>
            <label className="label-field">Perihal *</label>
            <input type="text" name="perihal" value={form.perihal} onChange={handleChange} className="input-field w-full" placeholder="Perihal / subjek surat" required />
          </div>
          <div>
            <label className="label-field">File Scan (PDF/JPG/PNG)</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" className="input-field w-full" style={{ padding: '8px 12px' }} />
            <p className="mt-1 text-xs" style={{ color: '#94A3B8' }}>Format: PDF, JPG, atau PNG. Maksimal 10MB.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</>) : 'Simpan Surat'}
            </button>
            <button type="button" onClick={() => navigate('/surat')} className="btn-secondary">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
