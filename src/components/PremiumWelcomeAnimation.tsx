import { useEffect, useRef } from "react";

interface PremiumWelcomeAnimationProps {
  onComplete: () => void;
}

const PremiumWelcomeAnimation = ({ onComplete }: PremiumWelcomeAnimationProps) => {
  const animationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Disable scroll while animation is active
    document.body.style.overflow = 'hidden';
    
    // Force reflow to ensure animation restarts
    if (animationRef.current) {
      animationRef.current.style.animation = 'none';
      animationRef.current.offsetHeight; // Trigger reflow
      animationRef.current.style.animation = '';
    }
    
    // Set a timeout to complete the animation
    const timer = setTimeout(() => {
      document.body.style.overflow = 'auto';
      onComplete();
    }, 2000); // 2 seconds as requested
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 bg-background flex items-center justify-center z-50"
      style={{ 
        backgroundColor: 'hsl(var(--cream-light))',
        background: 'linear-gradient(135deg, hsl(var(--cream-light)) 0%, hsl(var(--background)) 100%)'
      }}
    >
      <div className="text-center">
        <h1 
          ref={animationRef}
          className="welcome-text text-6xl md:text-8xl font-bold text-foreground relative"
          style={{ 
            color: 'hsl(var(--primary))',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 600
          }}
        >
          R<span className="relative inline-block signature-e">ē</span>Forma
        </h1>
      </div>
      
      <style>{`
        @keyframes cursive-fade-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          70% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes signature-bar {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          70% {
            transform: scaleX(1.1);
            opacity: 1;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        
        .welcome-text {
          animation: cursive-fade-in 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
          letter-spacing: 0.05em;
        }
        
        .signature-e::after {
          content: '';
          position: absolute;
          top: 35%;
          left: -15%;
          right: -15%;
          height: 3px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            hsl(var(--primary)) 15%, 
            hsl(var(--gold-accent)) 50%, 
            hsl(var(--primary)) 85%, 
            transparent 100%
          );
          transform: scaleX(0);
          transform-origin: left;
          animation: signature-bar 0.5s 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          box-shadow: 0 0 8px hsl(var(--gold-accent) / 0.4);
        }
      `}</style>
    </div>
  );
};

export default PremiumWelcomeAnimation;