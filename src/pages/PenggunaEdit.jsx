import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { LoadingSkeleton, Toast } from '../components/UI';
import { ArrowLeft } from 'lucide-react';

export default function PenggunaEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama_lengkap: '',
    role: '',
    bidang: '',
    is_active: true,
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPenggunaById(id);
      setForm({
        nama_lengkap: data.nama_lengkap,
        role: data.role,
        bidang: data.bidang || '',
        is_active: data.is_active,
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nama_lengkap: form.nama_lengkap,
        role: form.role,
        bidang: form.bidang || null,
        is_active: form.is_active,
      };
      await api.updatePengguna(id, payload);
      setToast({ message: 'Pengguna berhasil diperbarui', type: 'success' });
      setTimeout(() => navigate('/pengguna'), 1500);
    } catch (err) {
      setToast({ message: err.message || 'Gagal memperbarui pengguna', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!password) return;
    setChangingPassword(true);
    try {
      await api.updatePassword(id, password);
      setPassword('');
      setToast({ message: 'Password berhasil diubah', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ message: err.message || 'Gagal mengubah password', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setChangingPassword(false);
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

  if (loading) return <div><LoadingSkeleton rows={6} cols={2} /></div>;

  return (
    <div style={{ maxWidth: '640px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2" style={{ padding: '6px 12px' }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 className="text-ds-h1">Edit Pengguna</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
        </div>
      )}

      <div className="card mb-6">
        <h2 className="text-ds-h4 mb-4">Informasi Pengguna</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Nama Lengkap *</label>
            <input type="text" name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} className="input-field w-full" required />
          </div>
          <div>
            <label className="label-field">Role *</label>
            <select name="role" value={form.role} onChange={handleChange} className="input-field w-full" required>
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
          <div className="flex items-center gap-2">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="rounded" style={{ accentColor: '#1D4ED8' }} />
            <label className="text-sm font-medium" style={{ color: '#334155' }}>Akun Aktif</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Simpan Perubahan
            </button>
            <button type="button" onClick={() => navigate('/pengguna')} className="btn-secondary">Batal</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="text-ds-h4 mb-4">Ubah Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label-field">Password Baru</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field w-full" placeholder="Masukkan password baru" minLength={6} />
          </div>
          <button type="submit" disabled={changingPassword || !password} className="btn-secondary flex items-center gap-2">
            {changingPassword ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
            Ubah Password
          </button>
        </form>
      </div>
    </div>
  );
}
