const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';

console.log('\n===============================================================');
console.log('⚡ Zamonaviy Ta\'lim Dizayni — Tezkor Ishga Tushirish (SUPER FAST)');
console.log('===============================================================');
console.log('🌐 Sayt manzili:              http://localhost:3000');
console.log('📑 API & Swagger hujjatlari:  http://localhost:3000/api/docs');
console.log('⚡ Yagona API prefiksi:        http://localhost:3000/api/v1');
console.log('💡 Barcha sahifalar oldindan yig‘ilgan: Menyular bir zumda ochiladi!');
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

// 1. Start Backend API
startProcess('API Backend', 'npm run start:dev --workspace=api', rootDir);

// 2. Start Frontend Web (Production mode: 0 second wait time between pages)
startProcess('Frontend Web', 'npm run start --workspace=web', rootDir);

function cleanup() {
  console.log('\n🛑 Barcha serverlar to\'xtatilmoqda...');
  for (const { proc } of processes) {
    try {
      if (isWindows && proc.pid) {
        spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { stdio: 'ignore' });
      } else if (proc.pid) {
        proc.kill('SIGINT');
      }
    } catch {
      // ignore
    }
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
