const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function matchesWhere(item, where) {
  if (!where) return true;

  for (const [key, condition] of Object.entries(where)) {
    if (key === 'OR' && Array.isArray(condition)) {
      if (!condition.some((subWhere) => matchesWhere(item, subWhere))) return false;
      continue;
    }
    if (key === 'AND' && Array.isArray(condition)) {
      if (!condition.every((subWhere) => matchesWhere(item, subWhere))) return false;
      continue;
    }
    if (key === 'NOT') {
      if (matchesWhere(item, condition)) return false;
      continue;
    }

    const val = item[key];

    if (condition === false) {
      if (val !== false && val !== undefined) return false;
    } else if (condition === null || condition === undefined) {
      if (val !== condition) return false;
    } else if (
      typeof condition === 'object' &&
      !Array.isArray(condition) &&
      !(condition instanceof Date)
    ) {
      if (condition.equals !== undefined && val !== condition.equals) return false;
      if (condition.not !== undefined && val === condition.not) return false;
      if (
        condition.in !== undefined &&
        (!Array.isArray(condition.in) || !condition.in.includes(val))
      )
        return false;
      if (
        condition.notIn !== undefined &&
        Array.isArray(condition.notIn) &&
        condition.notIn.includes(val)
      )
        return false;
      if (condition.contains !== undefined) {
        const needle = String(condition.contains).toLowerCase();
        const haystack = String(val || '').toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if (
        condition.startsWith !== undefined &&
        !String(val || '').startsWith(condition.startsWith)
      )
        return false;
      if (
        condition.endsWith !== undefined &&
        !String(val || '').endsWith(condition.endsWith)
      )
        return false;
      if (condition.gt !== undefined && !(val > condition.gt)) return false;
      if (condition.gte !== undefined && !(val >= condition.gte)) return false;
      if (condition.lt !== undefined && !(val < condition.lt)) return false;
      if (condition.lte !== undefined && !(val <= condition.lte)) return false;
    } else {
      if (val !== condition) return false;
    }
  }

  return true;
}

function sortRecords(records, orderBy) {
  if (!orderBy) return records;
  const orderList = Array.isArray(orderBy) ? orderBy : [orderBy];

  return [...records].sort((a, b) => {
    for (const rule of orderList) {
      for (const [field, direction] of Object.entries(rule)) {
        const valA = a[field];
        const valB = b[field];
        const dir = direction.toLowerCase() === 'desc' ? -1 : 1;

        if (valA instanceof Date && valB instanceof Date) {
          if (valA.getTime() !== valB.getTime()) {
            return (valA.getTime() - valB.getTime()) * dir;
          }
        } else if (valA < valB) {
          return -1 * dir;
        } else if (valA > valB) {
          return 1 * dir;
        }
      }
    }
    return 0;
  });
}

class InMemoryCollection {
  constructor(name, db) {
    this.name = name;
    this.db = db;
    this.records = [];
  }

  async findFirst(params = {}) {
    const { where, orderBy, include } = params;
    let filtered = this.records.filter((item) => matchesWhere(item, where));
    filtered = sortRecords(filtered, orderBy);
    const item = filtered[0] || null;
    return item ? this.resolveItem(item, include) : null;
  }

  async findUnique(params = {}) {
    return this.findFirst(params);
  }

  async findMany(params = {}) {
    const { where, orderBy, include, take, skip } = params;
    let filtered = this.records.filter((item) => matchesWhere(item, where));
    filtered = sortRecords(filtered, orderBy);

    if (typeof skip === 'number' && skip > 0) {
      filtered = filtered.slice(skip);
    }
    if (typeof take === 'number' && take > 0) {
      filtered = filtered.slice(0, take);
    }

    return Promise.all(filtered.map((item) => this.resolveItem(item, include)));
  }

  async create(params = {}) {
    const { data = {}, include } = params;
    const now = new Date();
    const id = data.id || `mock-${this.name}-${crypto.randomUUID().slice(0, 8)}`;

    const flatData = { ...data };
    const nestedOps = {};

    // Separate nested relations
    for (const [key, val] of Object.entries(data)) {
      if (val && typeof val === 'object' && val.create) {
        nestedOps[key] = val.create;
        delete flatData[key];
      }
    }

    const defaults = {};
    if (this.name === 'emailVerification' || this.name === 'phoneVerification') {
      defaults.isUsed = false;
      defaults.attempts = 0;
    }
    if (this.name === 'refreshToken') {
      defaults.isRevoked = false;
    }
    if (this.name === 'courseEnrollment') {
      defaults.progressPercent = 0;
      defaults.status = 'ACTIVE';
    }
    if (this.name === 'user') {
      defaults.status = 'ACTIVE';
      defaults.role = 'STUDENT';
    }

    const record = {
      id,
      createdAt: now,
      updatedAt: now,
      ...defaults,
      ...flatData,
    };

    this.records.push(record);

    // Handle nested creates
    if (nestedOps.profile && this.db.userProfile) {
      const prof = await this.db.userProfile.create({
        data: {
          ...nestedOps.profile,
          userId: id,
        },
      });
      record.profile = prof;
    }

    if (nestedOps.notificationPreference && this.db.notificationPreference) {
      await this.db.notificationPreference.create({
        data: {
          ...nestedOps.notificationPreference,
          userId: id,
        },
      });
    }

    return this.resolveItem(record, include);
  }

  async update(params = {}) {
    const { where, data = {}, include } = params;
    const record = await this.findFirst({ where });
    if (!record) {
      throw new Error(`Record to update not found in ${this.name}`);
    }

    Object.assign(record, data, { updatedAt: new Date() });
    return this.resolveItem(record, include);
  }

  async updateMany(params = {}) {
    const { where, data = {} } = params;
    const matching = this.records.filter((item) => matchesWhere(item, where));
    for (const item of matching) {
      Object.assign(item, data, { updatedAt: new Date() });
    }
    return { count: matching.length };
  }

  async delete(params = {}) {
    const { where } = params;
    const index = this.records.findIndex((item) => matchesWhere(item, where));
    if (index === -1) {
      throw new Error(`Record to delete not found in ${this.name}`);
    }
    const [deleted] = this.records.splice(index, 1);
    return deleted;
  }

  async deleteMany(params = {}) {
    const { where } = params;
    const initialLen = this.records.length;
    this.records = this.records.filter((item) => !matchesWhere(item, where));
    return { count: initialLen - this.records.length };
  }

  async count(params = {}) {
    const { where } = params;
    if (!where) return this.records.length;
    return this.records.filter((item) => matchesWhere(item, where)).length;
  }

  async upsert(params = {}) {
    const { where, update = {}, create = {}, include } = params;
    const existing = await this.findFirst({ where });
    if (existing) {
      return this.update({ where, data: update, include });
    } else {
      return this.create({ data: create, include });
    }
  }

  async resolveItem(item, include) {
    if (!item) return null;
    const clone = { ...item };

    if (!include) return clone;

    // User Relations
    if (this.name === 'user') {
      if (include.profile) {
        clone.profile =
          (await this.db.userProfile.findFirst({ where: { userId: item.id } })) ||
          clone.profile ||
          null;
      }
      if (include.teacherProfile) {
        clone.teacherProfile =
          (await this.db.teacherProfile.findFirst({ where: { userId: item.id } })) || null;
      }
      if (include.notificationPreference) {
        clone.notificationPreference =
          (await this.db.notificationPreference.findFirst({
            where: { userId: item.id },
          })) || null;
      }
    }

    // TeacherProfile Relations
    if (this.name === 'teacherProfile') {
      if (include.user) {
        const u = await this.db.user.findFirst({ where: { id: item.userId } });
        if (u) {
          const uProfile = await this.db.userProfile.findFirst({
            where: { userId: u.id },
          });
          clone.user = { ...u, profile: uProfile };
        } else {
          clone.user = null;
        }
      }
    }

    // Course Relations
    if (this.name === 'course') {
      if (include.category) {
        clone.category =
          (await this.db.courseCategory.findFirst({
            where: { id: item.categoryId },
          })) || null;
      }
      if (include.teacher) {
        const t = await this.db.teacherProfile.findFirst({
          where: { id: item.teacherId },
        });
        if (t) {
          const u = await this.db.user.findFirst({ where: { id: t.userId } });
          const up = u
            ? await this.db.userProfile.findFirst({ where: { userId: u.id } })
            : null;
          clone.teacher = { ...t, user: u ? { ...u, profile: up } : null };
        } else {
          clone.teacher = null;
        }
      }
      if (include.lessons) {
        clone.lessons = await this.db.lesson.findMany({
          where: { courseId: item.id },
          orderBy: { orderNumber: 'asc' },
        });
      }
    }

    // Lesson Relations
    if (this.name === 'lesson') {
      if (include.materials) {
        clone.materials = await this.db.courseMaterial.findMany({
          where: { lessonId: item.id },
        });
      }
    }

    return clone;
  }
}

class InMemoryDatabase {
  constructor() {
    this.models = [
      'user',
      'userProfile',
      'userSession',
      'refreshToken',
      'emailVerification',
      'phoneVerification',
      'passwordReset',
      'teacherProfile',
      'teacherVerification',
      'course',
      'courseCategory',
      'courseEnrollment',
      'lesson',
      'lessonProgress',
      'courseMaterial',
      'review',
      'favorite',
      'notification',
      'notificationPreference',
      'telegramAccount',
      'telegramLinkToken',
      'report',
      'auditLog',
      'quiz',
      'quizQuestion',
      'quizAttempt',
    ];

    for (const model of this.models) {
      this[model] = new InMemoryCollection(model, this);
    }

    this.seedDefaultData();
  }

  async $transaction(arg) {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    if (typeof arg === 'function') {
      return arg(this);
    }
    return arg;
  }

  async $queryRaw() {
    return [{ '?column?': 1 }];
  }

  seedDefaultData() {
    const adminHash = '$2a$10$5F5NMvfavl4YBnqLJb4MbOqUR8l21lJXXaxAPWGbC336izxDmv286'; // Admin123!
    const teacherHash = '$2a$10$5VqwVfGXebMZPIlAQFS.EeYm.24dygd9NnJ42gMOD2k.f6JoGNdji'; // Teacher123!
    const studentHash = '$2a$10$cnJzAuPVInjZvElDIkShQeG09IA/HjChN.EDGTP58qnOICR2laejC'; // Student123!

    // 1. Admin User
    this.user.records.push({
      id: 'user-admin-1',
      email: 'admin@talim.uz',
      phone: '+998900000001',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: 'prof-admin',
        userId: 'user-admin-1',
        fullName: 'Platforma Ma’muri',
        headline: 'Bosh Boshqaruvchi',
      },
    });

    // 2. Teacher User
    this.user.records.push({
      id: 'user-teacher-1',
      email: 'teacher@talim.uz',
      phone: '+998900000002',
      passwordHash: teacherHash,
      role: 'TEACHER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: 'prof-teacher',
        userId: 'user-teacher-1',
        fullName: 'Anvar Narzullayev',
        headline: 'Senior Full Stack Dasturchi & Mentor',
        bio: '10+ yillik tajribaga ega dasturchi va xalqaro toifadagi ustoz.',
      },
    });

    // Teacher Profile
    this.teacherProfile.records.push({
      id: 'tp-1',
      userId: 'user-teacher-1',
      headline: 'Senior Full Stack Dasturchi & Mentor',
      bio: '10+ yillik tajribaga ega dasturchi va xalqaro toifadagi ustoz.',
      verificationStatus: 'APPROVED',
      verifiedAt: new Date(),
      rating: 4.9,
      reviewsCount: 128,
      studentsCount: 2450,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Student User
    this.user.records.push({
      id: 'user-student-1',
      email: 'student@talim.uz',
      phone: '+998900000003',
      passwordHash: studentHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: 'prof-student',
        userId: 'user-student-1',
        fullName: 'Islom Abdug‘aniyev',
        headline: 'Talaba & Izlanuvchi',
      },
    });

    // 4. Categories
    const categories = [
      { id: 'cat-1', name: 'Dasturlash & IT', slug: 'dasturlash', icon: 'Code', description: 'Web, Mobile, Backend va AI dasturlash' },
      { id: 'cat-2', name: 'Dizayn & Grafika', slug: 'dizayn', icon: 'Palette', description: 'UI/UX dizayn, Figma, 3D modellashtirish' },
      { id: 'cat-3', name: 'Biznes & Boshqaruv', slug: 'biznes', icon: 'TrendingUp', description: 'Startap, loyihalarni boshqarish va marketing' },
      { id: 'cat-4', name: 'Xorijiy Tillar', slug: 'tillar', icon: 'Languages', description: 'Ingliz, Nemis, Rus tillari va IELTS' },
      { id: 'cat-5', name: 'Ma’lumotlar & Data Science', slug: 'data-science', icon: 'Database', description: 'SQL, Python Data Science, Machine Learning' },
    ];

    for (const cat of categories) {
      this.courseCategory.records.push({ ...cat, createdAt: new Date(), updatedAt: new Date() });
    }

    // 5. Courses
    this.course.records.push({
      id: 'course-1',
      title: 'Zamonaviy JavaScript va React 18: Noldan Mutaxassisgacha',
      slug: 'zamonaviy-javascript-react-18',
      subtitle: 'Zamonaviy frontend dasturlash, real loyihalar va amaliyot',
      description: 'Ushbu kursda siz JavaScript ES6+ imkoniyatlari, React kutubxonasi, hooks, state management va Next.js asoslarini mukammal o‘rganasiz.',
      teacherId: 'tp-1',
      categoryId: 'cat-1',
      level: 'Boshlang‘ich',
      language: 'O‘zbekcha',
      durationHours: 36,
      price: 350000,
      originalPrice: 500000,
      status: 'PUBLISHED',
      isFeatured: true,
      rating: 4.9,
      reviewCount: 84,
      studentsCount: 520,
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.course.records.push({
      id: 'course-2',
      title: 'Mukammal UI/UX Dizayn va Figma Mahorati',
      slug: 'mukammal-ui-ux-dizayn-figma',
      subtitle: 'Foydalanuvchi interfeysi, prototiplash va dizayn tizimlari',
      description: 'Figma orqali professional web va mobil ilovalar dizaynini yaratish, dizayn tizimlari qurish va mijozlar bilan ishlash sirlari.',
      teacherId: 'tp-1',
      categoryId: 'cat-2',
      level: 'O‘rta',
      language: 'O‘zbekcha',
      durationHours: 24,
      price: 0,
      originalPrice: 200000,
      isFree: true,
      status: 'PUBLISHED',
      isFeatured: true,
      rating: 5.0,
      reviewCount: 42,
      studentsCount: 1100,
      thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 6. Lessons for Course 1
    this.lesson.records.push({
      id: 'lesson-1-1',
      courseId: 'course-1',
      title: '1-Dars: Kirish va Rivojlanish Muhitini Sozlash',
      slug: 'kirish-va-muhitni-sozlash',
      description: 'Node.js, VS Code va terminal bilan tanishuv',
      orderNumber: 1,
      durationMinutes: 25,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isFreePreview: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.lesson.records.push({
      id: 'lesson-1-2',
      courseId: 'course-1',
      title: '2-Dars: JavaScript ES6+ Yangiliklari va Asinxronlik',
      slug: 'javascript-es6-yangiliklari',
      description: 'Arrow functions, Promises, Async/Await chuqur tahlil',
      orderNumber: 2,
      durationMinutes: 45,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isFreePreview: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Student Enrollment in Course 1
    this.courseEnrollment.records.push({
      id: 'enr-1',
      userId: 'user-student-1',
      courseId: 'course-1',
      status: 'ACTIVE',
      progressPercent: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

module.exports = {
  InMemoryDatabase,
  InMemoryCollection,
};
