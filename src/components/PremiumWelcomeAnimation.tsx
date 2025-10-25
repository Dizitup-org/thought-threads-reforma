import { useEffect } from "react";

interface PremiumWelcomeAnimationProps {
  onComplete: () => void;
}

const PremiumWelcomeAnimation = ({ onComplete }: PremiumWelcomeAnimationProps) => {
  useEffect(() => {
    // Disable scroll while animation is active
    document.body.style.overflow = 'hidden';
    
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
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="text-center">
        <h1 
          className="serif-heading text-5xl md:text-6xl font-bold text-foreground relative"
          style={{ 
            color: 'hsl(var(--foreground))',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}
        >
          R<span className="relative inline-block">ē</span>Forma
        </h1>
      </div>
      
      <style>{`
        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          30% {
            opacity: 1;
            transform: scale(1.05);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          70% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        
        h1 {
          animation: fade-in-scale 1.8s forwards;
        }
        
        h1 span.relative::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background-color: hsl(var(--foreground));
          transform: scaleX(0);
          transform-origin: left;
          animation: slide-in 0.5s 0.6s forwards;
        }
        
        @keyframes slide-in {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumWelcomeAnimation;