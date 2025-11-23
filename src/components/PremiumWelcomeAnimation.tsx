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
      style={{ 
        backgroundColor: 'hsl(var(--cream-light))',
        background: 'linear-gradient(135deg, hsl(var(--cream-light)) 0%, hsl(var(--background)) 100%)'
      }}
    >
      <div className="text-center">
        <h1 
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
        @keyframes cursive-write {
          0% {
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        @keyframes letter-appear {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .welcome-text {
          animation: cursive-write 2s ease-in-out forwards;
          letter-spacing: 0.05em;
        }
        
        .welcome-text > * {
          display: inline-block;
          animation: letter-appear 0.3s ease-out forwards;
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
          animation: signature-bar 0.6s 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          box-shadow: 0 0 8px hsl(var(--gold-accent) / 0.4);
        }
        
        @keyframes signature-bar {
          0% {
            transform: scaleX(0) translateY(0);
            opacity: 0;
          }
          60% {
            transform: scaleX(1.1) translateY(-2px);
            opacity: 1;
          }
          100% {
            transform: scaleX(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumWelcomeAnimation;