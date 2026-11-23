const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Test suite configuration
const JWT_ACCESS_SECRET = 'jwt-access-secret-key-talim-2026';
const JWT_REFRESH_SECRET = 'jwt-refresh-secret-key-talim-2026';
const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

// In-memory mock database store for end-to-end auth simulation
const db = {
  users: new Map(),
  userProfiles: new Map(),
  emailVerifications: [],
  phoneVerifications: [],
  refreshTokens: [],
  passwordResets: [],
};

// Simulated OtpService
class SimulatedOtpService {
  generateSecureOtp() {
    return crypto.randomInt(100000, 999999).toString();
  }

  async hashOtp(otp) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
  }

  async verifyOtpHash(plainOtp, hash) {
    return bcrypt.compare(plainOtp, hash);
  }

  async sendEmailOtp(email) {
    // 1. Check resend cooldown
    const recent = db.emailVerifications
      .filter((v) => v.email === email && !v.isUsed)
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    if (recent) {
      const secondsSince = (Date.now() - recent.createdAt.getTime()) / 1000;
      if (secondsSince < RESEND_COOLDOWN_SECONDS) {
        throw new Error(`COOLDOWN_ACTIVE: ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSince)}s`);
      }
    }

    const rawOtp = this.generateSecureOtp();
    const otpHash = await this.hashOtp(rawOtp);
    const record = {
      id: `ev-${Date.now()}`,
      email,
      otpHash,
      attempts: 0,
      isUsed: false,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      createdAt: new Date(),
    };
    db.emailVerifications.push(record);

    return { rawOtp, record };
  }

  async verifyEmailOtp(email, submittedOtp) {
    const record = db.emailVerifications
      .filter((v) => v.email === email && !v.isUsed)
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    if (!record) {
      throw new Error('OTP_NOT_FOUND');
    }

    if (new Date() > record.expiresAt) {
      throw new Error('OTP_EXPIRED');
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      throw new Error('MAX_ATTEMPTS_EXCEEDED');
    }

    const isValid = await this.verifyOtpHash(submittedOtp, record.otpHash);
    if (!isValid) {
      record.attempts += 1;
      throw new Error(`INVALID_OTP: attempts=${record.attempts}`);
    }

    record.isUsed = true;
    return true;
  }
}

// Simulated AuthService
class SimulatedAuthService {
  constructor(otpService) {
    this.otpService = otpService;
  }

  async register({ email, phone, password, fullName, role = 'STUDENT' }) {
    if (!email && !phone) throw new Error('EMAIL_OR_PHONE_REQUIRED');

    for (const u of db.users.values()) {
      if (email && u.email === email) throw new Error('EMAIL_EXISTS');
      if (phone && u.phone === phone) throw new Error('PHONE_EXISTS');
    }

    let passwordHash = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const user = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      email,
      phone,
      passwordHash,
      role,
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    db.users.set(user.id, user);

    const profile = {
      id: `prof-${user.id}`,
      userId: user.id,
      fullName: fullName || 'Talaba',
    };
    db.userProfiles.set(profile.id, profile);

    const tokens = await this.generateTokens(user);
    return { user, profile, tokens };
  }

  async loginWithPassword({ emailOrPhone, password }) {
    let user = null;
    for (const u of db.users.values()) {
      if (u.email === emailOrPhone || u.phone === emailOrPhone) {
        user = u;
        break;
      }
    }

    if (!user || !user.passwordHash) throw new Error('INVALID_CREDENTIALS');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new Error('INVALID_CREDENTIALS');

    if (user.status !== 'ACTIVE') throw new Error('ACCOUNT_INACTIVE');

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken) {
    if (!refreshToken) throw new Error('NO_TOKEN');

    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (e) {
      throw new Error('TOKEN_EXPIRED_OR_INVALID');
    }

    const tokenRecord = db.refreshTokens
      .filter((t) => t.userId === payload.sub && !t.isRevoked)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!tokenRecord) throw new Error('TOKEN_REVOKED');

    const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const isMatch = incomingHash === tokenRecord.tokenHash;
    if (!isMatch) {
      // Possible reuse attack: revoke all user tokens
      db.refreshTokens
        .filter((t) => t.userId === payload.sub)
        .forEach((t) => (t.isRevoked = true));
      throw new Error('TOKEN_REUSE_DETECTED');
    }

    // Revoke old token
    tokenRecord.isRevoked = true;

    const user = db.users.get(payload.sub);
    return this.generateTokens(user);
  }

  async logout(userId) {
    db.refreshTokens
      .filter((t) => t.userId === userId && !t.isRevoked)
      .forEach((t) => (t.isRevoked = true));
    return { success: true };
  }

  async generateTokens(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(
      { ...payload, jti: crypto.randomBytes(16).toString('hex') },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' },
    );

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    db.refreshTokens.push({
      id: `rt-${Date.now()}`,
      userId: user.id,
      tokenHash,
      isRevoked: false,
      createdAt: new Date(),
    });

    return { accessToken, refreshToken, expiresIn: 900 };
  }
}

// ==================== TEST RUNNER ====================
async function runAuthTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 ULTRA+ EDUCATION PLATFORM — AUTHENTICATION TEST SUITE');
  console.log('🧪 ========================================================\n');

  const otpService = new SimulatedOtpService();
  const authService = new SimulatedAuthService(otpService);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`❌ TEST FAILED: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  }

  // 1. Password Hashing (Bcrypt) Test
  console.log('--- TEST GROUP 1: Xavfsiz Parol Hashingi (Bcrypt) ---');
  const plainPassword = 'SuperSecretPassword2026!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);
  assert(hash.startsWith('$2a$') || hash.startsWith('$2b$'), 'Bcrypt hash format to‘g‘ri');
  assert(hash !== plainPassword, 'Parol ochiq holatda saqlanmaydi');
  assert(await bcrypt.compare(plainPassword, hash), 'To‘g‘ri parol muvaffaqiyatli solishtirildi');
  assert(!(await bcrypt.compare('WrongPassword', hash)), 'Noto‘g‘ri parol rad etildi');

  // 2. User Registration Test
  console.log('\n--- TEST GROUP 2: Foydalanuvchini Ro‘yxatdan O‘tkazish ---');
  const regResult = await authService.register({
    email: 'student@talim.uz',
    phone: '+998901234567',
    password: 'Password123!',
    fullName: 'Aziz Rahimov',
    role: 'STUDENT',
  });
  assert(regResult.user.id !== undefined, 'Foydalanuvchi ID yaratildi');
  assert(regResult.user.role === 'STUDENT', 'Roli STUDENT etib belgilandi');
  assert(regResult.tokens.accessToken !== undefined, 'Access token yaratildi');
  assert(regResult.tokens.refreshToken !== undefined, 'Refresh token yaratildi');

  // Duplicate registration rejection
  let duplicateThrew = false;
  try {
    await authService.register({ email: 'student@talim.uz', password: '123' });
  } catch (err) {
    duplicateThrew = true;
    assert(err.message === 'EMAIL_EXISTS', 'Dublikat email to‘g‘ri bloklandi');
  }
  assert(duplicateThrew, 'Dublikat email ro‘yxatdan o‘tkazilmadi');

  // 3. Password Login Test
  console.log('\n--- TEST GROUP 3: Parol orqali Kirish (Login) ---');
  const loginResult = await authService.loginWithPassword({
    emailOrPhone: 'student@talim.uz',
    password: 'Password123!',
  });
  assert(loginResult.accessToken !== undefined, 'Kirishda yangi Access token berildi');

  let wrongPassThrew = false;
  try {
    await authService.loginWithPassword({
      emailOrPhone: 'student@talim.uz',
      password: 'IncorrectPassword',
    });
  } catch (err) {
    wrongPassThrew = true;
    assert(err.message === 'INVALID_CREDENTIALS', 'Noto‘g‘ri parol to‘g‘ri rad etildi');
  }
  assert(wrongPassThrew, 'Noto‘g‘ri parol bilan kirish bloklandi');

  // 4. 6-Digit Secure OTP Generation & Hashing
  console.log('\n--- TEST GROUP 4: 6-Xonali OTP Kod va Hashing ---');
  const otpRes = await otpService.sendEmailOtp('student@talim.uz');
  assert(otpRes.rawOtp.length === 6, 'OTP kod aynan 6 ta raqamdan iborat');
  assert(/^\d{6}$/.test(otpRes.rawOtp), 'OTP faqat raqamlardan iborat');
  assert(otpRes.record.otpHash !== otpRes.rawOtp, 'OTP bazada xeshlab saqlangan');
  assert(await otpService.verifyOtpHash(otpRes.rawOtp, otpRes.record.otpHash), 'OTP xeshi mos keldi');

  // 5. OTP Cooldown Check
  console.log('\n--- TEST GROUP 5: OTP Qayta Yuborish Cooldown (60s) ---');
  let cooldownThrew = false;
  try {
    await otpService.sendEmailOtp('student@talim.uz');
  } catch (err) {
    cooldownThrew = true;
    assert(err.message.startsWith('COOLDOWN_ACTIVE'), 'Cooldown vaqti to‘g‘ri tekshirildi');
  }
  assert(cooldownThrew, 'Cooldown vaqtida qayta yuborish bloklandi');

  // 6. OTP Attempt Limits (5 Max Attempts)
  console.log('\n--- TEST GROUP 6: Noto‘g‘ri OTP Urinishlari Cheklovi ---');
  let attemptCaught = 0;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      await otpService.verifyEmailOtp('student@talim.uz', '000000');
    } catch (err) {
      attemptCaught++;
    }
  }
  assert(attemptCaught === MAX_ATTEMPTS, '5 ta noto‘g‘ri urinish qayd etildi');

  let maxAttemptsThrew = false;
  try {
    // 6th attempt with correct OTP must fail because max attempts exceeded
    await otpService.verifyEmailOtp('student@talim.uz', otpRes.rawOtp);
  } catch (err) {
    maxAttemptsThrew = true;
    assert(err.message === 'MAX_ATTEMPTS_EXCEEDED', 'Maksimal urinishlar oshgach to‘g‘ri bloklandi');
  }
  assert(maxAttemptsThrew, 'Maksimal urinishlardan so‘ng kod yaroqsiz bo‘ldi');

  // 7. Refresh Token Rotation Test
  console.log('\n--- TEST GROUP 7: Refresh Token Rotation & Sessiya Boshqaruvi ---');
  const initialRefresh = loginResult.refreshToken;
  const rotatedTokens = await authService.refreshTokens(initialRefresh);
  assert(rotatedTokens.accessToken !== undefined, 'Yangi Access token berildi');
  assert(rotatedTokens.refreshToken !== initialRefresh, 'Eski Refresh token yangisi bilan almashtirildi');

  // Try using old refresh token again (Token reuse prevention)
  let oldTokenThrew = false;
  try {
    await authService.refreshTokens(initialRefresh);
  } catch (err) {
    oldTokenThrew = true;
    assert(
      err.message === 'TOKEN_REVOKED' || err.message === 'TOKEN_REUSE_DETECTED',
      'Eski refresh token to‘g‘ri aniqlandi va bloklandi (Token Reuse Prevention)',
    );
  }
  assert(oldTokenThrew, 'Eski refresh tokendan qayta foydalanish bloklandi');

  // 8. Logout Test
  console.log('\n--- TEST GROUP 8: Tizimdan Chiqish (Logout) ---');
  await authService.logout(regResult.user.id);
  let logoutThrew = false;
  try {
    await authService.refreshTokens(rotatedTokens.refreshToken);
  } catch (err) {
    logoutThrew = true;
    assert(err.message === 'TOKEN_REVOKED', 'Logoutdan keyin barcha tokenlar bekor qilindi');
  }
  assert(logoutThrew, 'Chiqib ketilgan foydalanuvchi sessiyasi yopildi');

  // 9. Role-Based Access Control (RBAC) Test
  console.log('\n--- TEST GROUP 9: Rol Asosidagi Ruxsatlar (RBAC) ---');
  const studentPayload = jwt.verify(regResult.tokens.accessToken, JWT_ACCESS_SECRET);
  assert(studentPayload.role === 'STUDENT', 'Talaba roli tokenda to‘g‘ri joylashtirildi');

  const teacherReg = await authService.register({
    email: 'teacher@talim.uz',
    password: 'Password123!',
    role: 'TEACHER',
  });
  const teacherPayload = jwt.verify(teacherReg.tokens.accessToken, JWT_ACCESS_SECRET);
  assert(teacherPayload.role === 'TEACHER', 'Ustoz roli tokenda to‘g‘ri joylashtirildi');

  console.log('\n========================================================');
  console.log(`🎉 BARCHA ${passedTests} TA AUTH TESTLARI MUVAFFAQIYATLI O‘TDI! (0 XATOLIK)`);
  console.log('========================================================\n');
}

runAuthTests().catch((err) => {
  console.error('\n❌ Test xatosi bilan to‘xtadi:', err);
  process.exit(1);
});
