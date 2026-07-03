import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full" style={{ maxWidth: '420px' }}>
        <div className="text-center mb-8">
          <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#1D4ED8' }}>SiDis</h1>
          <p className="mt-2" style={{ color: '#475569' }}>Sistem Informasi Disposisi dan Pelacakan Surat Digital</p>
          <img src="/logo.png" alt="Logo SMP Muhammadiyah 9 YK" className="mx-auto mt-3 h-40 w-40 object-contain" />
          <p className="mt-1" style={{ fontSize: '12px', color: '#475569' }}>SMP Muhammadiyah 9 Yogyakarta</p>
        </div>
        <div className="card">
          <h2 className="text-ds-h3 mb-6">Masuk ke Sistem</h2>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" placeholder="Masukkan username" required />
            </div>
            <div>
              <label className="label-field">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Masukkan password" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Memproses...</>) : ('Masuk')}
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/lacak" className="text-sm hover:underline" style={{ color: '#1D4ED8' }}>Lacak surat tanpa login →</a>
          </div>
        </div>
        <p className="text-center mt-6" style={{ fontSize: '12px', color: '#475569' }}>&copy; 2026 SMP Muhammadiyah 9 Yogyakarta</p>
      </div>
    </div>
  );
}
