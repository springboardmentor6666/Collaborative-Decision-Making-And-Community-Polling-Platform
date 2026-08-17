import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';

const quotes = [
  'Great decisions start with great conversations...',
  'Bringing your team\'s ideas together...',
  'Your collaborative workspace is loading...',
  'Empowering smarter choices, one vote at a time...',
  'Where every voice matters in every decision...',
  'Building consensus, creating impact...',
  'Transform ideas into actionable decisions...',
  'Collaboration is the key to innovation...',
];

function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export default function PageTransition({ children }) {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [deviceType, setDeviceType] = useState(getDeviceType);
  const [showLoader, setShowLoader] = useState(true);

  // Track responsive screen size / device type
  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const quote = useMemo(
    () => quotes[Math.floor(Math.random() * quotes.length)],
    [location.pathname]
  );

  // Device-tailored loader duration
  useEffect(() => {
    if (prefersReducedMotion) {
      setShowLoader(false);
      return undefined;
    }

    setShowLoader(true);
    // Snappy on mobile (650ms), smooth on tablet (800ms), cinematic on desktop (900ms)
    const duration = deviceType === 'mobile' ? 650 : deviceType === 'tablet' ? 800 : 900;
    const timer = window.setTimeout(() => setShowLoader(false), duration);
    return () => window.clearTimeout(timer);
  }, [location.pathname, prefersReducedMotion, deviceType]);

  // Page transition animation variants (using opacity to preserve viewport fixed positioning of sidebars and modals)
  const variants = useMemo(() => {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }, []);

  const transitionConfig = useMemo(() => {
    if (prefersReducedMotion) return { duration: 0.1 };
    if (deviceType === 'mobile') return { duration: 0.2, ease: 'easeOut' };
    if (deviceType === 'tablet') return { duration: 0.25, ease: 'easeOut' };
    return { duration: 0.3, ease: 'easeOut' };
  }, [deviceType, prefersReducedMotion]);

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={transitionConfig}
          className="min-h-screen w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {!prefersReducedMotion && (
        <AnimatePresence>
          {showLoader && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: deviceType === 'mobile' ? 0.18 : 0.25 }}
              className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
              style={{ background: 'var(--loader-bg)' }}
            >
              {/* Responsive ambient floating orbs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{
                    x: deviceType === 'mobile' ? [0, 15, -10, 0] : [0, 30, -20, 0],
                    y: deviceType === 'mobile' ? [0, -10, 8, 0] : [0, -20, 15, 0],
                    scale: deviceType === 'mobile' ? [1, 1.1, 0.95, 1] : [1, 1.2, 0.9, 1],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute left-[10%] top-[15%] rounded-full blur-3xl ${
                    deviceType === 'mobile' ? 'h-28 w-28' : deviceType === 'tablet' ? 'h-36 w-36' : 'h-48 w-48'
                  }`}
                  style={{ backgroundColor: 'var(--primary-soft)' }}
                />
                <motion.div
                  animate={{
                    x: deviceType === 'mobile' ? [0, -12, 10, 0] : [0, -25, 20, 0],
                    y: deviceType === 'mobile' ? [0, 8, -12, 0] : [0, 15, -25, 0],
                    scale: [1, 0.9, 1.1, 1],
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute bottom-[15%] right-[10%] rounded-full blur-3xl ${
                    deviceType === 'mobile' ? 'h-32 w-32' : deviceType === 'tablet' ? 'h-44 w-44' : 'h-56 w-56'
                  }`}
                  style={{ backgroundColor: 'var(--primary-soft)', opacity: 0.6 }}
                />
              </div>

              {/* Responsive main loader content */}
              <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex flex-col items-center ${
                  deviceType === 'mobile' ? 'gap-4 px-4' : 'gap-6 px-6'
                }`}
              >
                {/* Responsive glassmorphic logo container */}
                <motion.div
                  initial={{ scale: 0.92 }}
                  animate={{ scale: [0.95, 1.02, 0.98, 1] }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`flex items-center justify-center border border-border-default backdrop-blur-2xl ${
                    deviceType === 'mobile'
                      ? 'h-20 w-20 rounded-2xl'
                      : deviceType === 'tablet'
                      ? 'h-24 w-24 rounded-3xl'
                      : 'h-28 w-28 rounded-[2.2rem]'
                  }`}
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--surface) 60%, transparent)',
                    boxShadow: 'var(--shadow)',
                  }}
                >
                  {/* Spinning animated logo */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="relative"
                  >
                    <div
                      className={`logo-color-shift flex items-center justify-center bg-primary shadow-app ${
                        deviceType === 'mobile'
                          ? 'h-12 w-12 rounded-xl'
                          : deviceType === 'tablet'
                          ? 'h-14 w-14 rounded-2xl'
                          : 'h-16 w-16 rounded-[1.6rem]'
                      }`}
                    >
                      <svg
                        viewBox="0 0 48 48"
                        className={`text-white ${
                          deviceType === 'mobile' ? 'h-6 w-6' : deviceType === 'tablet' ? 'h-8 w-8' : 'h-9 w-9'
                        }`}
                        aria-hidden="true"
                      >
                        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4">
                          <circle cx="10" cy="24" r="4" fill="currentColor" stroke="none" />
                          <circle cx="24" cy="10" r="4" fill="currentColor" stroke="none" />
                          <circle cx="38" cy="24" r="4" fill="currentColor" stroke="none" />
                          <circle cx="24" cy="38" r="4" fill="currentColor" stroke="none" />
                          <path d="M13 21L21 13" />
                          <path d="M27 13L35 21" />
                          <path d="M13 27L21 35" />
                          <path d="M27 35L35 27" />
                        </g>
                      </svg>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Brand name */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="text-center"
                >
                  <h2
                    className={`font-black tracking-tight text-text-primary ${
                      deviceType === 'mobile' ? 'text-lg' : 'text-xl'
                    }`}
                  >
                    DecisionHub
                  </h2>
                </motion.div>

                {/* Responsive Progress bar */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0.5 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className={`overflow-hidden rounded-full bg-surface-alt backdrop-blur-sm ${
                    deviceType === 'mobile' ? 'w-36 h-1' : deviceType === 'tablet' ? 'w-40 h-1' : 'w-48 h-1'
                  }`}
                >
                  <div className="buffer-progress h-full w-full rounded-full" />
                </motion.div>

                {/* Responsive Motivational quote */}
                <motion.p
                  key={quote}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className={`text-center font-medium italic text-muted ${
                    deviceType === 'mobile' ? 'text-xs max-w-[260px]' : 'text-sm max-w-xs'
                  }`}
                >
                  "{quote}"
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
