const pool = require('./db');

/**
 * DB Migration Script — SiDis
 * 
 * Digunakan untuk menambah kolom, index, tabel baru TANPA menghapus data.
 * AMAN dijalankan berulang kali (idempotent).
 * 
 * ⚠ JANGAN jalankan `npm run db:init` untuk perubahan kecil — itu akan hapus semua data.
 * 
 * Cara pakai:
 *   node server/config/db-migrate.js
 * 
 * Format commit:
 *   [database] deskripsi perubahan
 */

const migrations = [
  // =====================================================
  // CONTOH: Tambah kolom baru
  // =====================================================
  // Uncomment block ini jika ingin tambah kolom kategori
  // {
  //   name: 'Tambah kolom kategori pada surat_masuk',
  //   sql: `ALTER TABLE surat_masuk ADD COLUMN IF NOT EXISTS kategori VARCHAR(50);`
  // },

  // =====================================================
  // CONTOH: Tambah index baru
  // =====================================================
  // Uncomment block ini jika ingin tambah index
  // {
  //   name: 'Tambah index pada kolom kategori',
  //   sql: `CREATE INDEX IF NOT EXISTS idx_surat_kategori ON surat_masuk(kategori);`
  // },

  // =====================================================
  // CONTOH: Tambah tabel baru
  // =====================================================
  // Uncomment block ini jika ingin tambah tabel baru
  // {
  //   name: 'Buat tabel lampiran',
  //   sql: `
  //     CREATE TABLE IF NOT EXISTS lampiran (
  //       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  //       surat_id UUID REFERENCES surat_masuk(id) ON DELETE CASCADE,
  //       nama_file VARCHAR(255) NOT NULL,
  //       file_data BYTEA,
  //       file_mime VARCHAR(50),
  //       created_at TIMESTAMP DEFAULT NOW()
  //     );
  //   `
  // },

  // =====================================================
  // CONTOH: Tambah enum value baru
  // =====================================================
  // Uncomment block ini jika ingin tambah value ke enum
  // {
  //   name: 'Tambah enum value DRAFT ke status_surat_enum',
  //   sql: `DO $$ BEGIN ALTER TYPE status_surat_enum ADD VALUE IF NOT EXISTS 'DRAFT'; EXCEPTION WHEN duplicate_object THEN null; END $$;`
  // },

  // =====================================================
  // CONTOH: Update seed data
  // =====================================================
  // Uncomment block ini jika ingin tambah user baru
  // {
  //   name: 'Tambah user baru',
  //   sql: `
  //     INSERT INTO pengguna (username, password, nama_lengkap, role, bidang)
  //     VALUES ('operator', '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012', 'Operator', 'GURU_STAF', 'Kurikulum')
  //     ON CONFLICT (username) DO NOTHING;
  //   `
  // },

  // =====================================================
  // Active: Ubah foreign key ke pengguna.id → ON DELETE SET NULL
  // =====================================================
  {
    name: 'Ubah FK surat_masuk.created_by → ON DELETE SET NULL',
    sql: `ALTER TABLE surat_masuk DROP CONSTRAINT IF EXISTS surat_masuk_created_by_fkey, ADD CONSTRAINT surat_masuk_created_by_fkey FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL;`
  },
  {
    name: 'Ubah FK disposisi.diberikan_oleh → ON DELETE SET NULL',
    sql: `ALTER TABLE disposisi DROP CONSTRAINT IF EXISTS disposisi_diberikan_oleh_fkey, ADD CONSTRAINT disposisi_diberikan_oleh_fkey FOREIGN KEY (diberikan_oleh) REFERENCES pengguna(id) ON DELETE SET NULL;`
  },
  {
    name: 'Ubah FK disposisi.diberikan_kepada → ON DELETE SET NULL',
    sql: `ALTER TABLE disposisi DROP CONSTRAINT IF EXISTS disposisi_diberikan_kepada_fkey, ADD CONSTRAINT disposisi_diberikan_kepada_fkey FOREIGN KEY (diberikan_kepada) REFERENCES pengguna(id) ON DELETE SET NULL;`
  },
  {
    name: 'Ubah FK status_surat.diubah_oleh → ON DELETE SET NULL',
    sql: `ALTER TABLE status_surat DROP CONSTRAINT IF EXISTS status_surat_diubah_oleh_fkey, ADD CONSTRAINT status_surat_diubah_oleh_fkey FOREIGN KEY (diubah_oleh) REFERENCES pengguna(id) ON DELETE SET NULL;`
  },
  {
    name: 'Ubah FK komentar.user_id → ON DELETE SET NULL',
    sql: `ALTER TABLE komentar DROP CONSTRAINT IF EXISTS komentar_user_id_fkey, ADD CONSTRAINT komentar_user_id_fkey FOREIGN KEY (user_id) REFERENCES pengguna(id) ON DELETE SET NULL;`
  },
  {
    name: 'Ubah FK audit_log.user_id → ON DELETE SET NULL',
    sql: `ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey, ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES pengguna(id) ON DELETE SET NULL;`
  },
  {
    name: 'Ubah FK notifikasi.user_id → ON DELETE SET NULL',
    sql: `ALTER TABLE notifikasi DROP CONSTRAINT IF EXISTS notifikasi_user_id_fkey, ADD CONSTRAINT notifikasi_user_id_fkey FOREIGN KEY (user_id) REFERENCES pengguna(id) ON DELETE SET NULL;`
  },

  // =====================================================
  // Tambahkan migration baru di bawah ini
  // Format:
  // {
  //   name: 'Deskripsi perubahan',
  //   sql: `SQL query yang aman`
  // }
  // =====================================================
];

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    console.log('=== SiDis DB Migration ===\n');

    if (migrations.length === 0) {
      console.log('Tidak ada migration yang perlu dijalankan.');
      console.log('\nCara menambah migration:');
      console.log('1. Buka file server/config/db-migrate.js');
      console.log('2. Uncomment block migration yang diinginkan');
      console.log('3. Atau tambahkan block baru di array migrations');
      console.log('4. Jalankan: node server/config/db-migrate.js');
      return;
    }

    for (const migration of migrations) {
      console.log(`▶ ${migration.name}`);
      try {
        await client.query(migration.sql);
        console.log(`  ✓ Berhasil\n`);
      } catch (err) {
        console.error(`  ✗ Gagal: ${err.message}\n`);
      }
    }

    console.log('=== Migration selesai ===');
  } finally {
    client.release();
  }
};

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations };
