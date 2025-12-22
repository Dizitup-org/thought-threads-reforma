import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumWelcomeAnimationProps {
  onComplete: () => void;
}

const PremiumWelcomeAnimation = ({ onComplete }: PremiumWelcomeAnimationProps) => {
  const [stage, setStage] = useState<'text' | 'bar' | 'complete'>('text');
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Stage 1: Text appears (0-1.4s)
    // Stage 2: Bar animates in (1.4s-2.2s)
    // Stage 3: Hold and fade out (2.2s-3s)
    
    const barTimer = setTimeout(() => setStage('bar'), 1400);
    const completeTimer = setTimeout(() => {
      setStage('complete');
      document.body.style.overflow = 'auto';
      onComplete();
    }, 3000);
    
    return () => {
      document.body.style.overflow = 'auto';
      clearTimeout(barTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const letters = 'Reforma'.split('');

  return (
    <AnimatePresence>
      {stage !== 'complete' && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ 
            background: 'linear-gradient(180deg, hsl(40 40% 97%) 0%, hsl(40 35% 94%) 100%)'
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="text-center px-4">
            {/* Main Brand Typography */}
            <h1 
              className="relative"
              style={{ 
                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                fontWeight: 300,
                fontSize: 'clamp(3rem, 12vw, 8rem)',
                letterSpacing: '0.08em',
                color: 'hsl(25 35% 25%)',
                lineHeight: 1,
              }}
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
                        top: '-0.08em',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        height: '2px',
                        background: 'hsl(25 35% 25%)',
                        transformOrigin: 'center',
                      }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={stage === 'bar' ? { 
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
            </h1>
            
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
                opacity: stage === 'bar' ? 0.8 : 0,
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
