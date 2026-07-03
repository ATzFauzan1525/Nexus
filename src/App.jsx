import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import SuratListPage from './pages/SuratList';
import SuratTambahPage from './pages/SuratTambah';
import SuratDetailPage from './pages/SuratDetail';
import DisposisiListPage from './pages/DisposisiList';
import DisposisiDetailPage from './pages/DisposisiDetail';
import DisposisiBidangPage from './pages/DisposisiBidang';
import DisposisiSayaPage from './pages/DisposisiSaya';
import DisposisiKepalaPage from './pages/DisposisiKepala';
import BuatDisposisiPage from './pages/BuatDisposisi';
import NotificationsPage from './pages/Notifications';
import PenggunaPage from './pages/Pengguna';
import PenggunaTambahPage from './pages/PenggunaTambah';
import PenggunaEditPage from './pages/PenggunaEdit';
import LaporanPage from './pages/Laporan';
import AuditLogPage from './pages/AuditLog';
import LacakPage from './pages/Lacak';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="animate-pulse" style={{ color: '#475569' }}>Memuat...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/lacak" element={<LacakPage />} />
      <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/surat" element={<ProtectedRoute roles={['ADMIN_TU', 'KEPALA_SEKOLAH', 'GURU_STAF', 'WAKASEK']}><SuratListPage /></ProtectedRoute>} />
      <Route path="/surat/tambah" element={<ProtectedRoute roles={['ADMIN_TU']}><SuratTambahPage /></ProtectedRoute>} />
      <Route path="/surat/:id" element={<ProtectedRoute><SuratDetailPage /></ProtectedRoute>} />
      <Route path="/disposisi" element={<ProtectedRoute roles={['KEPALA_SEKOLAH']}><DisposisiKepalaPage /></ProtectedRoute>} />
      <Route path="/disposisi/riwayat" element={<ProtectedRoute roles={['KEPALA_SEKOLAH']}><DisposisiListPage /></ProtectedRoute>} />
      <Route path="/disposisi/saya" element={<ProtectedRoute roles={['GURU_STAF']}><DisposisiSayaPage /></ProtectedRoute>} />
      <Route path="/disposisi/bidang" element={<ProtectedRoute roles={['WAKASEK']}><DisposisiBidangPage /></ProtectedRoute>} />
      <Route path="/disposisi/buat/:idSurat" element={<ProtectedRoute roles={['KEPALA_SEKOLAH']}><BuatDisposisiPage /></ProtectedRoute>} />
      <Route path="/disposisi/:id" element={<ProtectedRoute><DisposisiDetailPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/pengguna" element={<ProtectedRoute roles={['ADMIN_TU']}><PenggunaPage /></ProtectedRoute>} />
      <Route path="/pengguna/tambah" element={<ProtectedRoute roles={['ADMIN_TU']}><PenggunaTambahPage /></ProtectedRoute>} />
      <Route path="/pengguna/:id/edit" element={<ProtectedRoute roles={['ADMIN_TU']}><PenggunaEditPage /></ProtectedRoute>} />
      <Route path="/laporan" element={<ProtectedRoute roles={['ADMIN_TU', 'KEPALA_SEKOLAH']}><LaporanPage /></ProtectedRoute>} />
      <Route path="/audit-log" element={<ProtectedRoute roles={['ADMIN_TU', 'KEPALA_SEKOLAH']}><AuditLogPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
