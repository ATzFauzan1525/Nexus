const pool = require('../config/db');
const PDFDocument = require('pdfkit');

exports.generate = async (req, res) => {
  const { periode, tanggal_mulai, tanggal_akhir } = req.body;

  if (!periode || !tanggal_mulai || !tanggal_akhir) {
    return res.status(400).json({ message: 'Periode dan rentang tanggal wajib diisi' });
  }

  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_masuk,
        COUNT(CASE WHEN status = 'Selesai' THEN 1 END) as total_selesai,
        COUNT(CASE WHEN status != 'Selesai' AND id IN (SELECT surat_id FROM disposisi WHERE deadline < CURRENT_DATE) THEN 1 END) as total_overdue,
        COUNT(CASE WHEN status = 'Diterima' THEN 1 END) as total_diterima,
        COUNT(CASE WHEN status = 'Didisposisi' THEN 1 END) as total_didisposisi,
        COUNT(CASE WHEN status = 'Diproses' THEN 1 END) as total_diproses
       FROM surat_masuk
       WHERE tanggal_diterima >= $1 AND tanggal_diterima <= $2`,
      [tanggal_mulai, tanggal_akhir]
    );

    const detail = await pool.query(
      `SELECT s.*, p.nama_lengkap as pembuat_nama,
              d.instruksi, d.deadline as disposisi_deadline,
              pp.nama_lengkap as penerima_nama, pp.bidang::text as penerima_bidang,
              CASE
                WHEN s.status = 'Selesai' THEN 'Selesai Diproses'
                WHEN s.status = 'Diterima' THEN 'Menunggu Disposisi'
                WHEN s.status IN ('Didisposisi','Diproses') AND pp.nama_lengkap IS NOT NULL
                  THEN pp.nama_lengkap || ' (' || COALESCE(pp.bidang::text, 'Guru/Staf') || ')'
                ELSE 'Unit TU Sekolah'
              END as posisi_saat_ini
       FROM surat_masuk s
       LEFT JOIN pengguna p ON s.created_by = p.id
       LEFT JOIN disposisi d ON d.surat_id = s.id
       LEFT JOIN pengguna pp ON d.diberikan_kepada = pp.id
       WHERE s.tanggal_diterima >= $1 AND s.tanggal_diterima <= $2
       ORDER BY s.tanggal_diterima ASC`,
      [tanggal_mulai, tanggal_akhir]
    );

    const summary = result.rows[0];

    res.json({
      periode,
      tanggal_mulai,
      tanggal_akhir,
      summary: {
        total_masuk: parseInt(summary.total_masuk),
        total_selesai: parseInt(summary.total_selesai),
        total_overdue: parseInt(summary.total_overdue),
        total_diterima: parseInt(summary.total_diterima),
        total_didisposisi: parseInt(summary.total_didisposisi),
        total_diproses: parseInt(summary.total_diproses),
      },
      detail: detail.rows,
    });
  } catch (err) {
    console.error('Generate laporan error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.exportPDF = async (req, res) => {
  const { periode, tanggal_mulai, tanggal_akhir } = req.query;

  if (!periode || !tanggal_mulai || !tanggal_akhir) {
    return res.status(400).json({ message: 'Parameter tidak lengkap' });
  }

  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_masuk,
        COUNT(CASE WHEN status = 'Selesai' THEN 1 END) as total_selesai,
        COUNT(CASE WHEN status != 'Selesai' AND id IN (SELECT surat_id FROM disposisi WHERE deadline < CURRENT_DATE) THEN 1 END) as total_overdue,
        COUNT(CASE WHEN status = 'Diterima' THEN 1 END) as total_diterima,
        COUNT(CASE WHEN status = 'Didisposisi' THEN 1 END) as total_didisposisi,
        COUNT(CASE WHEN status = 'Diproses' THEN 1 END) as total_diproses
       FROM surat_masuk
       WHERE tanggal_diterima >= $1 AND tanggal_diterima <= $2`,
      [tanggal_mulai, tanggal_akhir]
    );

    const detail = await pool.query(
      `SELECT s.*, p.nama_lengkap as pembuat_nama,
              d.instruksi, d.deadline as disposisi_deadline,
              pp.nama_lengkap as penerima_nama, pp.bidang::text as penerima_bidang,
              CASE
                WHEN s.status = 'Selesai' THEN 'Selesai Diproses'
                WHEN s.status = 'Diterima' THEN 'Menunggu Disposisi'
                WHEN s.status IN ('Didisposisi','Diproses') AND pp.nama_lengkap IS NOT NULL
                  THEN pp.nama_lengkap || ' (' || COALESCE(pp.bidang::text, 'Guru/Staf') || ')'
                ELSE 'Unit TU Sekolah'
              END as posisi_saat_ini
       FROM surat_masuk s
       LEFT JOIN pengguna p ON s.created_by = p.id
       LEFT JOIN disposisi d ON d.surat_id = s.id
       LEFT JOIN pengguna pp ON d.diberikan_kepada = pp.id
       WHERE s.tanggal_diterima >= $1 AND s.tanggal_diterima <= $2
       ORDER BY s.tanggal_diterima ASC`,
      [tanggal_mulai, tanggal_akhir]
    );

    const summary = result.rows[0];

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_SiDis_${tanggal_mulai}_${tanggal_akhir}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).font('Helvetica-Bold').text('Laporan Surat Masuk', { align: 'center' });
    doc.fontSize(11).font('Helvetica').text('SMP Muhammadiyah 9 Yogyakarta', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Periode: ${periode} | ${tanggal_mulai} s/d ${tanggal_akhir}`, { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica-Bold').text('Ringkasan');
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(10);
    doc.text(`Total Surat Masuk: ${summary.total_masuk}`);
    doc.text(`Selesai: ${summary.total_selesai} | Didisposisi: ${summary.total_didisposisi} | Diproses: ${summary.total_diproses}`);
    doc.text(`Menunggu Disposisi: ${summary.total_diterima} | Terlambat: ${summary.total_overdue}`);
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica-Bold').text('Detail Surat');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const colWidths = [30, 70, 80, 110, 120, 90, 80, 100];
    const headers = ['No', 'Nomor Surat', 'Tanggal', 'Pengirim', 'Perihal', 'Disposisi Kepada', 'Status', 'Posisi Saat Ini'];

    let y = tableTop;
    doc.font('Helvetica-Bold').fontSize(8);
    let x = 40;
    headers.forEach((h, i) => {
      doc.text(h, x, y, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });
    y += 18;
    doc.moveTo(40, y).lineTo(780, y).stroke();
    y += 4;

    doc.font('Helvetica').fontSize(8);
    detail.rows.forEach((row, idx) => {
      if (y > 530) {
        doc.addPage();
        y = 40;
      }
      x = 40;
      const values = [
        String(idx + 1),
        row.nomor_surat || '-',
        row.tanggal_diterima ? new Date(row.tanggal_diterima).toLocaleDateString('id-ID') : '-',
        row.pengirim || '-',
        (row.perihal || '-').substring(0, 25),
        row.penerima_nama || '-',
        row.status || '-',
        row.posisi_saat_ini || '-',
      ];
      values.forEach((v, i) => {
        doc.text(v, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      y += 14;
    });

    doc.moveDown(2);
    doc.fontSize(9).font('Helvetica');
    const now = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    doc.text(`Dicetak pada: ${now}`, { align: 'right' });

    doc.end();
  } catch (err) {
    console.error('Export PDF error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
