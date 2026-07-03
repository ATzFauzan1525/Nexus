import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Toast } from '../components/UI';
import { ArrowLeft } from 'lucide-react';

export default function PenggunaTambahPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    nama_lengkap: '',
    role: '',
    bidang: '',
  });
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        username: form.username,
        password: form.password,
        nama_lengkap: form.nama_lengkap,
        role: form.role,
      };
      if (form.bidang) payload.bidang = form.bidang;

      await api.createPengguna(payload);
      setToast({ message: 'Pengguna berhasil ditambahkan', type: 'success' });
      setTimeout(() => navigate('/pengguna'), 1500);
    } catch (err) {
      setError(err.message || 'Gagal menambahkan pengguna');
      setToast({ message: err.message || 'Gagal menambahkan pengguna', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'ADMIN_TU', label: 'Admin TU' },
    { value: 'KEPALA_SEKOLAH', label: 'Kepala Sekolah' },
    { value: 'GURU_STAF', label: 'Guru/Staf' },
    { value: 'WAKASEK', label: 'Wakil Kepala Sekolah' },
  ];

  const bidangOptions = [
    { value: 'Kurikulum', label: 'Kurikulum' },
    { value: 'Kesiswaan', label: 'Kesiswaan' },
    { value: 'SaranaPrasarana', label: 'Sarana Prasarana' },
    { value: 'Humas', label: 'Humas' },
    { value: 'Keuangan', label: 'Keuangan' },
  ];

  const showBidang = form.role === 'GURU_STAF' || form.role === 'WAKASEK';

  return (
    <div style={{ maxWidth: '640px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2" style={{ padding: '6px 12px' }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-ds-h1">Tambah Pengguna</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Nama Lengkap *</label>
            <input type="text" name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} className="input-field w-full" placeholder="Nama lengkap pengguna" required />
          </div>
          <div>
            <label className="label-field">Username *</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} className="input-field w-full" placeholder="Username untuk login" required />
          </div>
          <div>
            <label className="label-field">Password *</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="input-field w-full" placeholder="Password" required minLength={6} />
          </div>
          <div>
            <label className="label-field">Role *</label>
            <select name="role" value={form.role} onChange={handleChange} className="input-field w-full" required>
              <option value="">Pilih role...</option>
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          {showBidang && (
            <div>
              <label className="label-field">Bidang</label>
              <select name="bidang" value={form.bidang} onChange={handleChange} className="input-field w-full">
                <option value="">Pilih bidang...</option>
                {bidangOptions.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Menyimpan...</>) : 'Simpan Pengguna'}
            </button>
            <button type="button" onClick={() => navigate('/pengguna')} className="btn-secondary">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
