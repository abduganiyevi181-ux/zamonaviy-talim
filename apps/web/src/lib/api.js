/**
 * ULTRA+ EDUCATION PLATFORM — API CLIENT
 * Handles REST requests to NestJS backend with JWT auth, token rotation, and resilient error handling.
 */

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '/api/v1';
  }
  return process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:4000/api/v1';
}

const API_BASE_URL = getApiBaseUrl();

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken') || null;
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken') || null;
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

export function setAuthTokens(accessToken, refreshToken, user = null) {
  if (typeof window === 'undefined') return;
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  } else {
    localStorage.removeItem('accessToken');
  }

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    localStorage.removeItem('refreshToken');
  }

  if (user) {
    setUser(user);
  }
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function hasRole(role) {
  const user = getUser();
  return user?.role === role;
}

// Deprecated alias for backwards compatibility
export const setAuthToken = (token) => setAuthTokens(token, null, null);

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const res = await fetch(`${baseUrl}${cleanEndpoint}`, config);
    const data = await res.json().catch(() => null);

    // Automatic token rotation on 401 Unauthorized
    if (res.status === 401 && !options._retry && getRefreshToken()) {
      const rfToken = getRefreshToken();
      try {
        const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rfToken }),
        });
        const refreshData = await refreshRes.json().catch(() => null);

        if (refreshRes.ok && refreshData?.data?.accessToken) {
          setAuthTokens(
            refreshData.data.accessToken,
            refreshData.data.refreshToken || rfToken,
          );
          // Retry original request with new access token
          return request(endpoint, { ...options, _retry: true });
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      }
    }

    if (!res.ok || data?.success === false) {
      const errorMsg = data?.message || data?.error || `So‘rov bajarilmadi (Status: ${res.status})`;
      return { success: false, error: errorMsg, status: res.status };
    }

    const responseData =
      data &&
      typeof data === 'object' &&
      data.success === true &&
      Object.prototype.hasOwnProperty.call(data, 'data')
        ? data.data
        : data;

    return { success: true, data: responseData };
  } catch (err) {
    return { success: false, error: err.message || 'Tarmoq xatosi yuz berdi' };
  }
}

export const api = {
  // Authentication
  auth: {
    register: (data) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    sendOtp: (emailOrPhone) =>
      request('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ emailOrPhone }),
      }),
    loginOtp: (data) =>
      request('/auth/login-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    refresh: (refreshToken) =>
      request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    forgotPassword: (emailOrPhone) =>
      request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ emailOrPhone }),
      }),
    resetPassword: (data) =>
      request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request('/auth/me'),
  },

  // Courses
  courses: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/courses${query ? `?${query}` : ''}`);
    },
    getBySlug: (slug) => request(`/courses/${slug}`),
  },

  // Categories
  categories: {
    list: () => request('/categories'),
    getBySlug: (slug) => request(`/categories/${slug}`),
  },

  // Teachers
  teachers: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/teachers${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/teachers/${id}`),
  },

  // Lessons
  lessons: {
    listByCourse: (courseId) => request(`/lessons/course/${courseId}`),
    getById: (lessonId) => request(`/lessons/${lessonId}`),
  },

  // Enrollments
  enrollments: {
    enroll: (courseId) =>
      request('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId }),
      }),
    myEnrollments: () => request('/enrollments/my'),
    checkStatus: (courseId) => request(`/enrollments/check/${courseId}`),
  },

  // Progress
  progress: {
    updateLessonProgress: (lessonId, { isCompleted, lastPositionSeconds }) =>
      request('/progress/lesson', {
        method: 'POST',
        body: JSON.stringify({ lessonId, isCompleted, lastPositionSeconds }),
      }),
    getCourseProgress: (courseId) => request(`/progress/course/${courseId}`),
  },

  // Quizzes
  quizzes: {
    getById: (quizId) => request(`/quizzes/${quizId}`),
    getByLesson: (lessonId) => request(`/quizzes/lesson/${lessonId}`),
    submit: (quizId, answers) =>
      request(`/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),
    getAttempts: (quizId) => request(`/quizzes/${quizId}/attempts`),
  },

  // Student Dashboard & Profile
  student: {
    getDashboard: () => request('/users/dashboard/overview'),
    getFavorites: () => request('/users/favorites'),
    toggleFavorite: (courseId) =>
      request(`/users/favorites/${courseId}`, { method: 'POST' }),
    getProfile: () => request('/users/me'),
    updateProfile: (data) =>
      request('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updatePreferences: (data) =>
      request('/users/me/preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getNotifications: (unreadOnly = false) =>
      request(`/notifications${unreadOnly ? '?unread=true' : ''}`),
    markNotificationRead: (id) =>
      request(`/notifications/${id}/read`, { method: 'PATCH' }),
  },

  // Teacher Dashboard & Course Management
  teacher: {
    getDashboard: () => request('/teachers/dashboard/overview'),
    getCourses: () => request('/teachers/dashboard/courses'),
    createCourse: (data) =>
      request('/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateCourse: (id, data) =>
      request(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    togglePublish: (id, isPublished) =>
      request(`/courses/${id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished }),
      }),
    createLesson: (data) =>
      request('/lessons', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateLesson: (id, data) =>
      request(`/lessons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteLesson: (id) =>
      request(`/lessons/${id}`, { method: 'DELETE' }),
    getStudents: () => request('/teachers/dashboard/students'),
    getAnalytics: () => request('/teachers/dashboard/analytics'),
    getReviews: () => request('/teachers/dashboard/reviews'),
    getVerification: () => request('/teachers/dashboard/verification'),
    applyVerification: (data) =>
      request('/teachers/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Admin Platform Control
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/users${query ? `?${query}` : ''}`);
    },
    getUserDetails: (id) => request(`/admin/users/${id}`),
    updateUserStatus: (id, status) =>
      request(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    updateUserRole: (id, role) =>
      request(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    getCourses: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/courses${query ? `?${query}` : ''}`);
    },
    updateCourseStatus: (id, status) =>
      request(`/admin/courses/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getVerifications: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/verifications${query ? `?${query}` : ''}`);
    },
    reviewVerification: (id, data) =>
      request(`/admin/verifications/${id}/review`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getCategories: () => request('/admin/categories'),
    createCategory: (data) =>
      request('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getReports: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/reports${query ? `?${query}` : ''}`);
    },
    updateReportStatus: (id, data) =>
      request(`/admin/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getAuditLogs: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/audit-logs${query ? `?${query}` : ''}`);
    },
  },

  // Telegram Bot Integration
  telegram: {
    getLinkToken: () => request('/telegram/link-token', { method: 'POST' }),
    getStatus: () => request('/telegram/status'),
    unlink: () => request('/telegram/unlink', { method: 'DELETE' }),
    broadcast: (message) =>
      request('/telegram/broadcast', {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
  },
};
