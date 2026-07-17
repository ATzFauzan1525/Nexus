const { exec } = require('child_process');

const port = process.argv[2] || 3000;
const isWin = process.platform === 'win32';

const cmd = isWin
  ? `netstat -ano | findstr :${port}`
  : `lsof -ti :${port}`;

const p = exec(cmd);
let data = '';

p.stdout.on('data', (chunk) => { data += chunk; });

p.on('close', () => {
  const ids = data.match(/\d+$/gm);
  if (!ids || ids.length === 0) {
    console.log(`Port ${port} is free`);
    return;
  }

  let killed = 0;
  ids.forEach((id) => {
    const killCmd = isWin ? `taskkill /F /PID ${id}` : `kill -9 ${id}`;
    exec(killCmd, () => {
      killed++;
      if (killed === ids.length) {
        console.log(`Killed ${ids.length} process(es) on port ${port}`);
      }
    });
  });
});

p.on('error', () => {
  console.log(`Port ${port} is free`);
});
