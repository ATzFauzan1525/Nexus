import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { LoadingSkeleton, EmptyState, Modal, Toast } from '../components/UI';
import { UserPlus, Trash2, Edit } from 'lucide-react';

export default function PenggunaPage() {
  const [pengguna, setPengguna] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [deleting, setDeleting] = useState(false);

  const fetchPengguna = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPengguna();
      setPengguna(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPengguna();
  }, [fetchPengguna]);

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    setDeleting(true);
    try {
      await api.deletePengguna(deleteModal.user.id);
      setToast({ message: 'Pengguna berhasil dihapus', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      setDeleteModal({ open: false, user: null });
      fetchPengguna();
    } catch (err) {
      setToast({ message: err.message || 'Gagal menghapus pengguna', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setDeleting(false);
    }
  };

  const roleLabels = {
    ADMIN_TU: 'Admin TU',
    KEPALA_SEKOLAH: 'Kepala Sekolah',
    GURU_STAF: 'Guru/Staf',
    WAKASEK: 'Wakil Kepala Sekolah',
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-ds-h1">Manajemen Pengguna</h1>
        <Link to="/pengguna/tambah" className="btn-primary flex items-center justify-center gap-2">
          <UserPlus size={16} /> Tambah Pengguna
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
          <button onClick={fetchPengguna} className="ml-3 underline font-medium">Coba Lagi</button>
        </div>
      )}

      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} cols={5} />
        ) : pengguna.length === 0 ? (
          <EmptyState
            icon={<UserPlus size={48} />}
            title="Belum Ada Pengguna"
            description="Belum ada pengguna yang terdaftar."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '550px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Nama</th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase hidden sm:table-cell" style={{ color: '#475569', letterSpacing: '0.05em' }}>Username</th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Role</th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase hidden md:table-cell" style={{ color: '#475569', letterSpacing: '0.05em' }}>Bidang</th>
                  <th className="text-right px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pengguna.map((p, idx) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{p.nama_lengkap}</p>
                      <p className="text-xs sm:hidden" style={{ color: '#475569' }}>@{p.username}</p>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm hidden sm:table-cell" style={{ color: '#334155' }}>{p.username}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm" style={{ color: '#334155' }}>{roleLabels[p.role] || p.role}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm hidden md:table-cell" style={{ color: '#475569' }}>{p.bidang || '-'}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/pengguna/${p.id}/edit`} className="p-1.5 rounded-md hover:bg-blue-50 transition-colors" style={{ color: '#475569' }} title="Edit">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => setDeleteModal({ open: true, user: p })} className="p-1.5 rounded-md hover:bg-red-50 transition-colors" style={{ color: '#DC2626' }} title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        title="Konfirmasi Hapus"
        footer={
          <>
            <button onClick={() => setDeleteModal({ open: false, user: null })} className="btn-secondary">Batal</button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger flex items-center gap-2">
              {deleting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 size={16} />}
              Hapus
            </button>
          </>
        }
      >
        <p className="text-sm" style={{ color: '#334155' }}>
          Apakah Anda yakin ingin menghapus pengguna <strong>{deleteModal.user?.nama_lengkap}</strong> secara permanen? Data terkait (disposisi, komentar) akan tetap ada tanpa nama pengguna.
        </p>
      </Modal>
    </div>
  );
}
