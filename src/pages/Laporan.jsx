import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { LoadingSkeleton, Toast } from '../components/UI';
import { StatusBadge } from '../components/UI';
import { FileText, Download } from 'lucide-react';

export default function LaporanPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN_TU';
  const [form, setForm] = useState({
    periode: 'harian',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_akhir: new Date().toISOString().split('T')[0],
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.generateLaporan(form);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Gagal generate laporan');
      setToast({ message: err.message || 'Gagal generate laporan', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const params = new URLSearchParams({
      periode: form.periode,
      tanggal_mulai: form.tanggal_mulai,
      tanggal_akhir: form.tanggal_akhir,
    });
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`/api/laporan/pdf?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_SiDis_${form.tanggal_mulai}_${form.tanggal_akhir}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const periodeLabels = {
    harian: 'Harian',
    mingguan: 'Mingguan',
    bulanan: 'Bulanan',
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-ds-h1">Laporan Rekapitulasi</h1>
        {report && (
          <button onClick={handleDownloadPDF} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Download PDF
          </button>
        )}
      </div>

      <div className="card mb-6">
        <h2 className="text-ds-h4 mb-4">Generate Laporan</h2>
        <form onSubmit={handleGenerate} className="flex gap-3 items-end">
          <div>
            <label className="label-field">Periode</label>
            <select name="periode" value={form.periode} onChange={handleChange} className="input-field" style={{ width: '140px' }}>
              <option value="harian">Harian</option>
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
            </select>
          </div>
          <div>
            <label className="label-field">Tanggal Mulai</label>
            <input type="date" name="tanggal_mulai" value={form.tanggal_mulai} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label-field">Tanggal Akhir</label>
            <input type="date" name="tanggal_akhir" value={form.tanggal_akhir} onChange={handleChange} className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileText size={16} />}
            Generate
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
        </div>
      )}

      {report && (
        <div className="card print:shadow-none" id="laporan-print">
          <div className="mb-6 text-center">
            <h2 className="text-ds-h2">Laporan Rekapitulasi Surat</h2>
            <p className="text-sm mt-1" style={{ color: '#475569' }}>
              Periode {periodeLabels[report.periode]} · {new Date(report.tanggal_mulai).toLocaleDateString('id-ID')} — {new Date(report.tanggal_akhir).toLocaleDateString('id-ID')}
            </p>
            <p className="text-sm" style={{ color: '#475569' }}>SMP Muhammadiyah 9 Yogyakarta</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Masuk', value: report.summary.total_masuk, color: '#1D4ED8' },
              { label: 'Selesai', value: report.summary.total_selesai, color: '#16A34A' },
              { label: 'Overdue', value: report.summary.total_overdue, color: '#DC2626' },
              { label: 'Diterima', value: report.summary.total_diterima, color: '#475569' },
              { label: 'Didisposisi', value: report.summary.total_didisposisi, color: '#D97706' },
              { label: 'Diproses', value: report.summary.total_diproses, color: '#0891B2' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-md" style={{ border: '1px solid #E2E8F0' }}>
                <p className="text-sm" style={{ color: '#475569' }}>{item.label}</p>
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>

          {report.detail.length > 0 && (
            <>
              <h3 className="text-ds-h4 mb-3">Detail Surat</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>No. Surat</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Tanggal</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Pengirim</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Perihal</th>
                      {isAdmin && (
                        <>
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Disposisi Kepada</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Instruksi</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Posisi Saat Ini</th>
                        </>
                      )}
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.detail.map((s, idx) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: '#0F172A' }}>{s.nomor_surat}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>{new Date(s.tanggal_diterima).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#334155' }}>{s.pengirim}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#334155' }}>{s.perihal}</td>
                        {isAdmin && (
                          <>
                            <td className="px-4 py-3 text-sm" style={{ color: '#334155' }}>
                              {s.penerima_nama ? `${s.penerima_nama} (${s.penerima_bidang || 'Guru/Staf'})` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm max-w-[200px] truncate" style={{ color: '#475569' }} title={s.instruksi || ''}>
                              {s.instruksi || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1D4ED8' }}>
                              {s.posisi_saat_ini}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {report.detail.length === 0 && (
            <div className="text-center py-8" style={{ color: '#94A3B8' }}>
              <p>Tidak ada data surat dalam periode ini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
