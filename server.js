require('dotenv').config();
const { createServer } = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSocket } = require('./server/socket');
const { initDB } = require('./server/config/db-init');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const PORT = parseInt(process.env.PORT, 10) || 3000;

const apiApp = express();
apiApp.use(cors({ credentials: true }));
apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: true }));

apiApp.use('/api/auth', require('./server/routes/auth'));
apiApp.use('/api/pengguna', require('./server/routes/pengguna'));
apiApp.use('/api/surat', require('./server/routes/surat'));
apiApp.use('/api/disposisi', require('./server/routes/disposisi'));
apiApp.use('/api/status', require('./server/routes/status'));
apiApp.use('/api/notifikasi', require('./server/routes/notifikasi'));
apiApp.use('/api/laporan', require('./server/routes/laporan'));
apiApp.use('/api/surat/:suratId/komentar', require('./server/routes/komentar'));
apiApp.use('/api/audit-log', require('./server/routes/auditLog'));
apiApp.use('/api/public', require('./server/routes/public'));

apiApp.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

apiApp.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ukuran file terlalu besar. Maksimal 10MB.' });
  }
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

let vite;
const startServer = async () => {
  // Don't run initDB on startup — Neon pooler routes to different backends.
  // Use 'npm run db:init' to create/reset schema instead.

  if (dev) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({ server: { middlewareMode: true } });
  }

  const server = createServer(async (req, res) => {
    const { parse } = require('url');
    const parsedUrl = parse(req.url, true);

    if (parsedUrl.pathname.startsWith('/api')) {
      return apiApp(req, res);
    }

    if (dev && vite) {
      return vite.middlewares(req, res);
    }

    const fs = require('fs');
    const filePath = path.join(__dirname, 'dist', parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
      res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    } else {
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream(indexPath).pipe(res);
    }
  });

  initSocket(server);

  server.listen(PORT, hostname, () => {
    console.log(`> SiDis ready on http://${hostname}:${PORT}`);
  });
};

startServer();
