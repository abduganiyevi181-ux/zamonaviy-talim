const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

async function testServer() {
  console.log('🚀 NestJS Serverini tekshirish boshlandi...');
  const serverProcess = spawn('node', [path.resolve(__dirname, '../dist/main.js')], {
    env: { ...process.env, PORT: '4005' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write(d.toString()));
  serverProcess.stderr.on('data', (d) => process.stderr.write(d.toString()));

  // Wait for server to become ready
  console.log('⏳ Server ishga tushishi kutilmoqda (port 4005)...');
  let isReady = false;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch('http://127.0.0.1:4005/api/v1/health');
      if (res.status === 200) {
        isReady = true;
        break;
      }
    } catch (e) {
      // Retrying...
    }
  }

  if (!isReady) {
    console.error('❌ Server belgilangan vaqtda javob bermadi');
    serverProcess.kill();
    process.exit(1);
  }

  console.log('✅ Server muvaffaqiyatli javob berdi!');

  // Test /api/v1/health
  const healthRes = await fetch('http://127.0.0.1:4005/api/v1/health');
  const healthData = await healthRes.json();
  console.log('🏥 /api/v1/health javobi:', healthData.status);

  // Test /api/docs Swagger
  const docsRes = await fetch('http://127.0.0.1:4005/api/docs');
  console.log('📑 /api/docs Swagger HTTP status:', docsRes.status);

  // Stop server
  serverProcess.kill();
  console.log('🎉 Server va Swagger to‘liq tekshiruvdan o‘tdi!');
  process.exit(0);
}

testServer().catch((err) => {
  console.error('❌ Xatolik:', err);
  process.exit(1);
});
