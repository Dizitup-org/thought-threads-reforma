import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumWelcomeAnimationProps {
  onComplete: () => void;
}

const PremiumWelcomeAnimation = ({ onComplete }: PremiumWelcomeAnimationProps) => {
  const [stage, setStage] = useState<'text' | 'bar' | 'complete'>('text');
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Stage 1: Text appears (0-1.2s)
    // Stage 2: Bar animates in (1.2s-2s)
    // Stage 3: Hold and fade out (2s-2.8s)
    
    const barTimer = setTimeout(() => setStage('bar'), 1200);
    const completeTimer = setTimeout(() => {
      setStage('complete');
      document.body.style.overflow = 'auto';
      onComplete();
    }, 2800);
    
    return () => {
      document.body.style.overflow = 'auto';
      clearTimeout(barTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'complete' && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ 
            background: 'linear-gradient(180deg, hsl(var(--cream-light)) 0%, hsl(var(--background)) 100%)'
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="text-center">
            <h1 
              className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl tracking-wide"
              style={{ 
                color: 'hsl(var(--primary))',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 400,
                letterSpacing: '0.02em'
              }}
            >
              {/* Letter-by-letter reveal */}
              {'reforma'.split('').map((letter, index) => (
                <motion.span
                  key={index}
                  className={`inline-block ${letter === 'e' ? 'relative' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6,
                    delay: index * 0.08,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                >
                  {letter}
                  
                  {/* Macron bar above 'e' */}
                  {letter === 'e' && (
                    <motion.span
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{
                        top: '-0.05em',
                        width: '70%',
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 20%, hsl(var(--primary)) 80%, transparent 100%)',
                      }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={stage === 'bar' ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                      transition={{ 
                        duration: 0.6,
                        ease: [0.4, 0, 0.2, 1],
                        delay: 0.1
                      }}
                    />
                  )}
                </motion.span>
              ))}
            </h1>
            
            {/* Subtle tagline */}
            <motion.p
              className="mt-6 text-sm md:text-base tracking-[0.3em] uppercase"
              style={{ 
                color: 'hsl(var(--muted-foreground))',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: stage === 'bar' ? 0.7 : 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Redefine Your Style
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PremiumWelcomeAnimation;
