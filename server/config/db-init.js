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
  bidang bidang_ENUM,
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
  created_by UUID REFERENCES pengguna(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disposisi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surat_id UUID REFERENCES surat_masuk(id) ON DELETE CASCADE,
  diberikan_oleh UUID REFERENCES pengguna(id),
  diberikan_kepada UUID REFERENCES pengguna(id),
  instruksi TEXT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS status_surat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surat_id UUID REFERENCES surat_masuk(id) ON DELETE CASCADE,
  status status_surat_enum NOT NULL,
  catatan TEXT,
  diubah_oleh UUID REFERENCES pengguna(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS komentar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surat_id UUID REFERENCES surat_masuk(id) ON DELETE CASCADE,
  user_id UUID REFERENCES pengguna(id),
  isi TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES pengguna(id),
  aksi VARCHAR(100) NOT NULL,
  entitas VARCHAR(50) NOT NULL,
  entitas_id UUID,
  detail TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifikasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES pengguna(id) ON DELETE CASCADE,
  judul VARCHAR(200) NOT NULL,
  pesan TEXT NOT NULL,
  tipe VARCHAR(50) NOT NULL,
  reference_id UUID,
  dibaca BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
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
