const { spawn } = require('child_process');
const path = require('path');

const target = process.argv[2] || 'all';
const rootDir = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\n===============================================================');
console.log('🚀 Zamonaviy Ta\'lim Dizayni — Yagona Localhost Muhiti (DEV)');
console.log('===============================================================');
console.log('🌐 Sayt manzili (Barcha sahifalar): http://localhost:3000');
console.log('📑 API va Swagger hujjatlari:       http://localhost:3000/api/docs');
console.log('⚡ Yagona API prefiksi:             http://localhost:3000/api/v1');
console.log('===============================================================\n');

const processes = [];

function startProcess(name, command, cwd) {
  const proc = spawn(command, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  proc.on('error', (err) => {
    console.error(`❌ [${name}] ishga tushirishda xatolik:`, err.message);
  });

  proc.on('exit', (code) => {
    if (code !== null && code !== 0 && code !== 130) {
      console.log(`⚠️ [${name}] jarayoni tugadi (kod: ${code})`);
    }
  });

  processes.push({ name, proc });
  return proc;
}

if (target === 'all' || target === 'api') {
  startProcess('API Backend', 'npm run dev:api', rootDir);
}

if (target === 'all' || target === 'web') {
  startProcess('Frontend Web', 'npm run dev:web', rootDir);
}

function cleanup() {
  console.log('\n🛑 Barcha dev serverlar to\'xtatilmoqda...');
  for (const { proc } of processes) {
    try {
      if (isWindows && proc.pid) {
        spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { stdio: 'ignore' });
      } else if (proc.pid) {
        proc.kill('SIGINT');
      }
    } catch {
      // ignore cleanup errors
    }
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
