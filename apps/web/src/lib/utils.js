import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind merge support
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value) {
  const [integer, fraction] = String(value).split('.');
  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return fraction === undefined ? groupedInteger : `${groupedInteger},${fraction}`;
}

/**
 * Standard spring and ease animations for Framer Motion adhering to reduced-motion
 */
export const transitions = {
  springFast: { type: 'spring', stiffness: 400, damping: 25 },
  springSmooth: { type: 'spring', stiffness: 300, damping: 24 },
  easeSmooth: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
};

/**
 * Accessibility check for prefers-reduced-motion
 */
export function getMotionProps(props = {}) {
  return {
    ...props,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
      ...props.transition,
    },
  };
}
