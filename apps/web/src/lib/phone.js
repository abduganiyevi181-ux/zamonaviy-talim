/**
 * Uzbekistan phone number formatting and validation utility
 */

export function formatUzPhone(value = '') {
  // Extract all digits
  let digits = value.replace(/\D/g, '');

  // If starts with 998, keep it; if user starts typing 90, prepend 998
  if (!digits.startsWith('998') && digits.length > 0) {
    if (digits.length <= 9) {
      digits = '998' + digits;
    }
  }

  // Cap at 12 digits (998 + 9 digits)
  digits = digits.slice(0, 12);

  // Format: +998 (XX) XXX-XX-XX
  let formatted = '+998';
  if (digits.length > 3) {
    formatted += ' (' + digits.slice(3, 5);
  }
  if (digits.length >= 5) {
    formatted += ') ' + digits.slice(5, 8);
  }
  if (digits.length >= 8) {
    formatted += '-' + digits.slice(8, 10);
  }
  if (digits.length >= 10) {
    formatted += '-' + digits.slice(10, 12);
  }

  return formatted;
}

export function isValidUzPhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length === 9 || (digits.length === 12 && digits.startsWith('998'));
}

export function cleanPhoneForApi(phone = '') {
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length === 12) {
    return '+' + digits;
  }
  if (digits.length === 9) {
    return '+998' + digits;
  }
  if (digits.startsWith('8') && digits.length === 10) {
    return '+998' + digits.slice(1);
  }
  if (digits.length > 9 && !digits.startsWith('998')) {
    digits = digits.slice(-9);
    return '+998' + digits;
  }
  return digits.length > 0 ? '+' + digits : '';
}
