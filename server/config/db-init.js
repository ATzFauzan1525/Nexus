const pool = require('./db');
const bcrypt = require('bcryptjs');

const dropAll = `
DROP TABLE IF EXISTS notifikasi CASCADE;
DROP TABLE IF EXISTS status_surat CASCADE;
DROP TABLE IF EXISTS disposisi CASCADE;
DROP TABLE IF EXISTS surat_masuk CASCADE;
DROP TABLE IF EXISTS pengguna CASCADE;
DROP TABLE IF EXISTS suratmasuk CASCADE;
DROP TABLE IF EXISTS statussurat CASCADE;
DROP TYPE IF EXISTS status_surat CASCADE;
DROP TYPE IF EXISTS status_surat_enum CASCADE;
DROP TYPE IF EXISTS role_pengguna CASCADE;
DROP TYPE IF EXISTS bidang_enum CASCADE;
DROP TYPE IF EXISTS bidang_ENUM CASCADE;
`;

const createAll = `
DO $$ BEGIN CREATE TYPE role_pengguna AS ENUM ('ADMIN_TU', 'KEPALA_SEKOLAH', 'GURU_STAF', 'WAKASEK'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE status_surat_enum AS ENUM ('Diterima', 'Didisposisi', 'Diproses', 'Selesai'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE bidang_enum AS ENUM ('Kurikulum', 'Kesiswaan', 'SaranaPrasarana', 'Humas', 'Keuangan'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS pengguna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  role role_pengguna NOT NULL,
  bidang bidang_enum,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS surat_masuk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_surat VARCHAR(50) UNIQUE NOT NULL,
  tanggal_diterima DATE NOT NULL,
  pengirim VARCHAR(200) NOT NULL,
  perihal VARCHAR(300) NOT NULL,
  file_scan VARCHAR(500),
  file_data BYTEA,
  file_mime VARCHAR(50),
  status status_surat_enum DEFAULT 'Diterima',
  created_by UUID REFERENCES pengguna(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disposisi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surat_id UUID REFERENCES surat_masuk(id) ON DELETE CASCADE,
  diberikan_oleh UUID REFERENCES pengguna(id) ON DELETE SET NULL,
  diberikan_kepada UUID REFERENCES pengguna(id) ON DELETE SET NULL,
  instruksi TEXT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS status_surat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surat_id UUID REFERENCES surat_masuk(id) ON DELETE CASCADE,
  status status_surat_enum NOT NULL,
  catatan TEXT,
  diubah_oleh UUID REFERENCES pengguna(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS komentar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surat_id UUID REFERENCES surat_masuk(id) ON DELETE CASCADE,
  user_id UUID REFERENCES pengguna(id) ON DELETE SET NULL,
  isi TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES pengguna(id) ON DELETE SET NULL,
  aksi VARCHAR(100) NOT NULL,
  entitas VARCHAR(50) NOT NULL,
  entitas_id UUID,
  detail TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifikasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES pengguna(id) ON DELETE SET NULL,
  judul VARCHAR(200) NOT NULL,
  pesan TEXT NOT NULL,
  tipe VARCHAR(50) NOT NULL,
  reference_id UUID,
  dibaca BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_pengguna_role ON pengguna(role);
CREATE INDEX IF NOT EXISTS idx_pengguna_bidang ON pengguna(bidang);
CREATE INDEX IF NOT EXISTS idx_pengguna_is_active ON pengguna(is_active);

CREATE INDEX IF NOT EXISTS idx_surat_nomor ON surat_masuk(nomor_surat);
CREATE INDEX IF NOT EXISTS idx_surat_status ON surat_masuk(status);
CREATE INDEX IF NOT EXISTS idx_surat_tanggal ON surat_masuk(tanggal_diterima);
CREATE INDEX IF NOT EXISTS idx_surat_pengirim ON surat_masuk(pengirim);
CREATE INDEX IF NOT EXISTS idx_surat_perihal ON surat_masuk(perihal);
CREATE INDEX IF NOT EXISTS idx_surat_created_by ON surat_masuk(created_by);

CREATE INDEX IF NOT EXISTS idx_disposisi_surat ON disposisi(surat_id);
CREATE INDEX IF NOT EXISTS idx_disposisi_penerima ON disposisi(diberikan_kepada);
CREATE INDEX IF NOT EXISTS idx_disposisi_pengirim ON disposisi(diberikan_oleh);
CREATE INDEX IF NOT EXISTS idx_disposisi_deadline ON disposisi(deadline);

CREATE INDEX IF NOT EXISTS idx_status_surat ON status_surat(surat_id);
CREATE INDEX IF NOT EXISTS idx_status_diubah ON status_surat(diubah_oleh);

CREATE INDEX IF NOT EXISTS idx_komentar_surat ON komentar(surat_id);
CREATE INDEX IF NOT EXISTS idx_komentar_user ON komentar(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_aksi ON audit_log(aksi);
CREATE INDEX IF NOT EXISTS idx_audit_entitas ON audit_log(entitas);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_notifikasi_user ON notifikasi(user_id);
CREATE INDEX IF NOT EXISTS idx_notifikasi_dibaca ON notifikasi(dibaca);
CREATE INDEX IF NOT EXISTS idx_notifikasi_tipe ON notifikasi(tipe);
`;

const seedUsers = async (client) => {
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  await client.query(
    `INSERT INTO pengguna (username, password, nama_lengkap, role, bidang)
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING`,
    ['admin', hashedAdmin, 'Admin TU', 'ADMIN_TU', null]
  );

  const hashedKepala = await bcrypt.hash('kepala123', 10);
  await client.query(
    `INSERT INTO pengguna (username, password, nama_lengkap, role, bidang)
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING`,
    ['kepala', hashedKepala, 'Dr. Ahmad Dahlan', 'KEPALA_SEKOLAH', null]
  );

  const bidang = ['Kurikulum', 'Kesiswaan', 'SaranaPrasarana', 'Humas', 'Keuangan'];
  const guruNames = ['Budi Santoso', 'Siti Rahayu', 'Andi Pratama', 'Dewi Lestari', 'Bendahara'];
  const wakasekNames = ['Wakil Kurikulum', 'Wakil Kesiswaan', 'Wakil Sarpras', 'Wakil Humas'];

  for (let i = 0; i < 5; i++) {
    const guruPass = await bcrypt.hash('guru123', 10);
    await client.query(
      `INSERT INTO pengguna (username, password, nama_lengkap, role, bidang)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING`,
      [`guru${i + 1}`, guruPass, guruNames[i], 'GURU_STAF', bidang[i]]
    );

    if (i < wakasekNames.length) {
      const wakasekPass = await bcrypt.hash('wakasek123', 10);
      await client.query(
        `INSERT INTO pengguna (username, password, nama_lengkap, role, bidang)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING`,
        [`wakasek${i + 1}`, wakasekPass, wakasekNames[i], 'WAKASEK', bidang[i]]
      );
    }
  }
};

// Full reset: drop + create + seed (use via: npm run db:init)
const initDB = async () => {
  const client = await pool.connect();
  try {
    console.log('Dropping all tables...');
    await client.query(dropAll);
    console.log('Creating schema...');
    await client.query(createAll);
    console.log('Seeding users...');
    await seedUsers(client);
    console.log('Database initialization complete');
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  initDB()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initDB };
