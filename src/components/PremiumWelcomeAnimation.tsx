import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumWelcomeAnimationProps {
  onComplete: () => void;
}

const PremiumWelcomeAnimation = ({ onComplete }: PremiumWelcomeAnimationProps) => {
  const [stage, setStage] = useState<'text' | 'bar' | 'drop' | 'ripple'>('text');
  const [isOpen, setIsOpen] = useState(true);
  const brandRef = useRef<HTMLHeadingElement | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; scale: number } | null>(null);
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Stage 1: Text appears (0-1.4s)
    // Stage 2: Macron animates in (1.4s-~2.0s)
    // Stage 3: Droplet falls and impacts (after macron)
    // Stage 4: Ripple expands across screen, then overlay fades out
    const barTimer = setTimeout(() => setStage('bar'), 1400);
    const dropTimer = setTimeout(() => setStage('drop'), 1850);
    const rippleTimer = setTimeout(() => setStage('ripple'), 2350);
    
    return () => {
      document.body.style.overflow = 'auto';
      clearTimeout(barTimer);
      clearTimeout(dropTimer);
      clearTimeout(rippleTimer);
    };
  }, [onComplete]);

  useEffect(() => {
    if (stage !== 'drop' && stage !== 'ripple') return;

    const rect = brandRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    const d1 = Math.hypot(x, y);
    const d2 = Math.hypot(window.innerWidth - x, y);
    const d3 = Math.hypot(x, window.innerHeight - y);
    const d4 = Math.hypot(window.innerWidth - x, window.innerHeight - y);
    const maxDist = Math.max(d1, d2, d3, d4);

    const base = 18;
    const scale = (maxDist * 2) / base;
    setRipple({ x, y, scale });
  }, [stage]);

  const letters = 'Reforma'.split('');

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.body.style.overflow = 'auto';
        onComplete();
      }}
    >
      {isOpen && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ 
            background: 'linear-gradient(180deg, hsl(40 40% 97%) 0%, hsl(40 35% 94%) 100%)'
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Droplet + impact */}
          {(stage === 'drop' || stage === 'ripple') && ripple && (
            <motion.div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <motion.div
                style={{
                  position: 'absolute',
                  left: ripple.x,
                  top: ripple.y,
                  width: 14,
                  height: 18,
                  marginLeft: -7,
                  marginTop: -9,
                  borderRadius: '50% 50% 55% 55% / 60% 60% 40% 40%',
                  background:
                    'radial-gradient(circle at 35% 30%, hsl(var(--background) / 0.95) 0%, hsl(var(--background) / 0.55) 28%, hsl(var(--background) / 0.10) 62%, transparent 72%)',
                  boxShadow: '0 10px 24px hsl(0 0% 0% / 0.10)',
                  opacity: 0.9,
                }}
                initial={{ y: -140, scale: 0.85, opacity: 0 }}
                animate={
                  stage === 'drop'
                    ? { y: 0, scale: 1, opacity: 0.95 }
                    : { y: 0, scale: [1, 0.88, 1.02], opacity: [0.95, 0.9, 0] }
                }
                transition={
                  stage === 'drop'
                    ? { duration: 0.6, ease: [0.55, 0.055, 0.675, 0.19] }
                    : { duration: 0.28, ease: [0.2, 0.9, 0.2, 1] }
                }
              />

              {/* Tiny crown ring at impact */}
              {stage === 'ripple' && (
                <motion.div
                  style={{
                    position: 'absolute',
                    left: ripple.x,
                    top: ripple.y,
                    width: 14,
                    height: 14,
                    marginLeft: -7,
                    marginTop: -7,
                    borderRadius: 9999,
                    background:
                      'radial-gradient(circle, transparent 55%, hsl(var(--background) / 0.55) 60%, transparent 70%)',
                    filter: 'blur(0.2px)',
                  }}
                  initial={{ scale: 0.25, opacity: 0 }}
                  animate={{ scale: 2.2, opacity: [0, 0.8, 0] }}
                  transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1], times: [0, 0.2, 1] }}
                />
              )}
            </motion.div>
          )}

          {/* Water ripple overlay */}
          {stage === 'ripple' && ripple && (
            <motion.div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {/* Soft water fill */}
              <motion.div
                style={{
                  position: 'absolute',
                  left: ripple.x,
                  top: ripple.y,
                  width: 18,
                  height: 18,
                  marginLeft: -9,
                  marginTop: -9,
                  borderRadius: 9999,
                  background:
                    'radial-gradient(circle, hsl(var(--background) / 0.0) 0%, hsl(var(--background) / 0.10) 24%, transparent 62%)',
                  filter: 'blur(0.3px)',
                }}
                initial={{ scale: 0.18, opacity: 0 }}
                animate={{
                  scale: ripple.scale,
                  opacity: [0, 0.55, 0.12],
                }}
                transition={{
                  duration: 2.15,
                  ease: [0.22, 0.61, 0.36, 1],
                  times: [0, 0.18, 1],
                }}
              />

              {/* Watery outline ring (no dark border) */}
              <motion.div
                style={{
                  position: 'absolute',
                  left: ripple.x,
                  top: ripple.y,
                  width: 18,
                  height: 18,
                  marginLeft: -9,
                  marginTop: -9,
                  borderRadius: 9999,
                  background:
                    'radial-gradient(circle, transparent 58%, hsl(var(--background) / 0.35) 62%, transparent 66%)',
                  boxShadow:
                    '0 0 14px hsl(var(--background) / 0.18), inset 0 0 10px hsl(var(--background) / 0.14)',
                  filter: 'blur(0.2px)',
                }}
                initial={{ scale: 0.18, opacity: 0 }}
                animate={{
                  scale: ripple.scale,
                  opacity: [0, 0.95, 0.18],
                }}
                transition={{
                  duration: 2.15,
                  ease: [0.22, 0.61, 0.36, 1],
                  times: [0, 0.12, 1],
                }}
              />

              {/* Secondary ripple ring for realism */}
              <motion.div
                style={{
                  position: 'absolute',
                  left: ripple.x,
                  top: ripple.y,
                  width: 18,
                  height: 18,
                  marginLeft: -9,
                  marginTop: -9,
                  borderRadius: 9999,
                  background:
                    'radial-gradient(circle, transparent 60%, hsl(var(--background) / 0.22) 64%, transparent 69%)',
                  filter: 'blur(0.25px)',
                }}
                initial={{ scale: 0.18, opacity: 0 }}
                animate={{
                  scale: ripple.scale * 1.03,
                  opacity: [0, 0.55, 0.1],
                }}
                transition={{
                  duration: 2.15,
                  delay: 0.12,
                  ease: [0.22, 0.61, 0.36, 1],
                  times: [0, 0.2, 1],
                }}
                onAnimationComplete={() => {
                  // End the welcome screen exactly when the ripple completes (no dead wait).
                  window.setTimeout(() => setIsOpen(false), 120);
                }}
              />
            </motion.div>
          )}

          <div className="text-center px-4">
            {/* Main Brand Typography */}
            <motion.h1
              ref={brandRef}
              className="relative"
              style={{ 
                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                fontWeight: 300,
                fontSize: 'clamp(3rem, 12vw, 8rem)',
                letterSpacing: '0.08em',
                color: 'hsl(25 35% 25%)',
                lineHeight: 1,
              }}
              animate={stage === 'ripple' ? { opacity: 0, y: -4, filter: 'blur(1.5px)' } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            >
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  className={`inline-block ${letter === 'e' ? 'relative' : ''}`}
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    filter: 'blur(0px)'
                  }}
                  transition={{ 
                    duration: 0.8,
                    delay: 0.15 + index * 0.09,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  style={{
                    display: 'inline-block',
                  }}
                >
                  {letter}
                  
                  {/* Macron bar above 'e' - the brand mark */}
                  {letter === 'e' && (
                    <motion.span
                      className="absolute"
                      style={{
                        top: '-0.2em',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '0.62em',
                        height: '1.5px',
                        borderRadius: '9999px',
                        background: 'hsl(25 35% 25%)',
                        transformOrigin: 'center',
                      }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={stage === 'bar' || stage === 'ripple' ? { 
                        scaleX: 1, 
                        opacity: 1,
                      } : { scaleX: 0, opacity: 0 }}
                      transition={{ 
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0
                      }}
                    />
                  )}
                </motion.span>
              ))}
            </motion.h1>
            
            {/* Subtle brand tagline */}
            <motion.p
              style={{ 
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: 'hsl(25 20% 45%)',
                marginTop: 'clamp(1.5rem, 4vw, 2.5rem)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: stage === 'bar' ? 0.8 : stage === 'ripple' ? 0 : 0,
                y: stage === 'bar' ? 0 : 10
              }}
              transition={{ 
                duration: 0.6, 
                delay: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              Fashion. Reimagined.
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PremiumWelcomeAnimation;
