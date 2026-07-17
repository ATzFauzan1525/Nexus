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

  const getTanggalByPeriode = (periode) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (periode === 'harian') {
      return { tanggal_mulai: todayStr, tanggal_akhir: todayStr };
    }

    if (periode === 'mingguan') {
      const mingguLalu = new Date(today);
      mingguLalu.setDate(mingguLalu.getDate() - 6);
      const yyyy2 = mingguLalu.getFullYear();
      const mm2 = String(mingguLalu.getMonth() + 1).padStart(2, '0');
      const dd2 = String(mingguLalu.getDate()).padStart(2, '0');
      return { tanggal_mulai: `${yyyy2}-${mm2}-${dd2}`, tanggal_akhir: todayStr };
    }

    if (periode === 'bulanan') {
      const bulanLalu = new Date(today);
      bulanLalu.setDate(bulanLalu.getDate() - 29);
      const yyyy3 = bulanLalu.getFullYear();
      const mm3 = String(bulanLalu.getMonth() + 1).padStart(2, '0');
      const dd3 = String(bulanLalu.getDate()).padStart(2, '0');
      return { tanggal_mulai: `${yyyy3}-${mm3}-${dd3}`, tanggal_akhir: todayStr };
    }

    return { tanggal_mulai: todayStr, tanggal_akhir: todayStr };
  };
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'periode') {
      const range = getTanggalByPeriode(value);
      setForm({ ...form, periode: value, ...range });
    } else {
      setForm({ ...form, [name]: value });
    }
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
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const params = new URLSearchParams({
      periode: form.periode,
      tanggal_mulai: form.tanggal_mulai,
      tanggal_akhir: form.tanggal_akhir,
    });
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${apiUrl}/api/laporan/pdf?${params.toString()}`, {
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-ds-h1">Laporan Rekapitulasi</h1>
        {report && (
          <button onClick={handleDownloadPDF} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Download PDF
          </button>
        )}
      </div>

      <div className="card mb-6">
        <h2 className="text-ds-h4 mb-4">Generate Laporan</h2>
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="w-full sm:w-auto">
            <label className="label-field">Periode</label>
            <select name="periode" value={form.periode} onChange={handleChange} className="input-field w-full sm:w-[140px]">
              <option value="harian">Harian</option>
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="label-field">Tanggal Mulai</label>
            <input type="date" name="tanggal_mulai" value={form.tanggal_mulai} onChange={handleChange} className="input-field w-full" />
          </div>
          <div className="flex-1">
            <label className="label-field">Tanggal Akhir</label>
            <input type="date" name="tanggal_akhir" value={form.tanggal_akhir} onChange={handleChange} className="input-field w-full" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            {[
              { label: 'Total Masuk', value: report.summary.total_masuk, color: '#1D4ED8' },
              { label: 'Selesai', value: report.summary.total_selesai, color: '#16A34A' },
              { label: 'Overdue', value: report.summary.total_overdue, color: '#DC2626' },
              { label: 'Diterima', value: report.summary.total_diterima, color: '#475569' },
              { label: 'Didisposisi', value: report.summary.total_didisposisi, color: '#D97706' },
              { label: 'Diproses', value: report.summary.total_diproses, color: '#0891B2' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-md" style={{ border: '1px solid #E2E8F0' }}>
                <p className="text-xs md:text-sm" style={{ color: '#475569' }}>{item.label}</p>
                <p className="text-xl md:text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>

          {report.detail.length > 0 && (
            <>
              <h3 className="text-ds-h4 mb-3">Detail Surat</h3>
              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: '600px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                      <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>No. Surat</th>
                      <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase hidden sm:table-cell" style={{ color: '#475569', letterSpacing: '0.05em' }}>Tanggal</th>
                      <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase hidden md:table-cell" style={{ color: '#475569', letterSpacing: '0.05em' }}>Pengirim</th>
                      <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Perihal</th>
                      {isAdmin && (
                        <>
                          <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase hidden lg:table-cell" style={{ color: '#475569', letterSpacing: '0.05em' }}>Disposisi</th>
                          <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase hidden lg:table-cell" style={{ color: '#475569', letterSpacing: '0.05em' }}>Instruksi</th>
                          <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase hidden md:table-cell" style={{ color: '#475569', letterSpacing: '0.05em' }}>Posisi</th>
                        </>
                      )}
                      <th className="text-left px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase" style={{ color: '#475569', letterSpacing: '0.05em' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.detail.map((s, idx) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-sm font-medium" style={{ color: '#0F172A' }}>{s.nomor_surat}</td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-sm hidden sm:table-cell" style={{ color: '#475569' }}>{new Date(s.tanggal_diterima).toLocaleDateString('id-ID')}</td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-sm hidden md:table-cell" style={{ color: '#334155' }}>{s.pengirim}</td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-sm truncate max-w-[120px] md:max-w-none" style={{ color: '#334155' }}>{s.perihal}</td>
                        {isAdmin && (
                          <>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-sm hidden lg:table-cell" style={{ color: '#334155' }}>
                              {s.penerima_nama ? `${s.penerima_bidang || 'Guru/Staf'}` : '-'}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-sm max-w-[120px] truncate hidden lg:table-cell" style={{ color: '#475569' }} title={s.instruksi || ''}>
                              {s.instruksi || '-'}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-sm font-medium hidden md:table-cell" style={{ color: '#1D4ED8' }}>
                              {s.posisi_saat_ini}
                            </td>
                          </>
                        )}
                        <td className="px-3 md:px-4 py-2 md:py-3"><StatusBadge status={s.status} /></td>
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
