/**
 * Shared Utilities and Constants for Zamonaviy Ta'lim Monorepo
 */

const USER_ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
});

const API_ENDPOINTS = Object.freeze({
  HEALTH: '/health',
  USERS: '/users',
  STATUS: '/status',
});

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function createApiResponse(data = null, message = 'Success', success = true) {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  USER_ROLES,
  API_ENDPOINTS,
  isValidEmail,
  slugify,
  createApiResponse,
};
