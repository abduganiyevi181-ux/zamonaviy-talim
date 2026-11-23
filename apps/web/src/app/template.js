'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }) {
  const pathname = usePathname();
  const firstRender = useRef(true);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setShowProgress(true);
    const timer = window.setTimeout(() => setShowProgress(false), 650);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ scaleX: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
            className="route-progress"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.div
        key={pathname}
        initial={firstRender.current ? false : { opacity: 0, y: 12, filter: 'blur(3px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </>
  );
}
