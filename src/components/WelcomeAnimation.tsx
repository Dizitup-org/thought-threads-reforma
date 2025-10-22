import { useState, useEffect } from "react";

interface WelcomeAnimationProps {
  onComplete: () => void;
}

const WelcomeAnimation = ({ onComplete }: WelcomeAnimationProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        setTimeout(onComplete, 300);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {currentStep === 0 && (
        <div className="text-center animate-fade-in-up">
          <h1 className="serif-heading text-5xl md:text-7xl font-bold text-elegant">
            REFORMA
          </h1>
          <div className="w-24 h-1 bg-accent mx-auto mt-6 rounded-full animate-pulse-subtle"></div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="text-center animate-fade-in-up">
          <h2 className="serif-heading text-2xl md:text-3xl font-semibold text-primary">
            Fashion. Reimagined.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Minimalist elegance for deep thinkers
          </p>
        </div>
      )}

      {currentStep === 2 && (
        <div className="text-center animate-fade-in-up">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground mt-4">Preparing your experience</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeAnimation;