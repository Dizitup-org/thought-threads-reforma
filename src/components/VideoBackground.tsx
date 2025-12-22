import { motion } from "framer-motion";

interface VideoBackgroundProps {
  videoSrc?: string;
  gifSrc?: string;
  imageSrc?: string;
  children?: React.ReactNode;
  overlayOpacity?: number;
  overlayColor?: string;
}

const VideoBackground = ({ 
  videoSrc, 
  gifSrc, 
  imageSrc,
  children,
  overlayOpacity = 0.5,
  overlayColor = "var(--cream-light)"
}: VideoBackgroundProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video Background with Premium Visual Treatment */}
      {videoSrc && (
        <motion.video
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'saturate(0.85) contrast(1.05) brightness(0.95)',
          }}
          autoPlay
          loop
          muted
          playsInline
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </motion.video>
      )}
      
      {/* GIF Background */}
      {gifSrc && !videoSrc && (
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${gifSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'saturate(0.85) contrast(1.05) brightness(0.95)',
          }}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
      )}
      
      {/* Static Image Background (fallback) */}
      {imageSrc && !videoSrc && !gifSrc && (
        <motion.div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundPosition: 'center right',
            backgroundSize: 'cover',
            objectFit: 'cover',
            filter: 'saturate(0.85) contrast(1.05) brightness(0.95)',
          }}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
      )}
      
      {/* Premium Warm Tint Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(40 50% 95% / 0.12) 0%, hsl(25 35% 28% / 0.08) 100%)',
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Subtle Vignette Effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, hsl(25 30% 15% / 0.25) 100%)',
        }}
      />
      
      {/* Gradient Overlay for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, hsl(${overlayColor} / ${overlayOpacity + 0.25}) 0%, hsl(${overlayColor} / ${overlayOpacity + 0.1}) 35%, hsl(${overlayColor} / ${overlayOpacity * 0.3}) 60%, transparent 80%)`
        }}
      />
      
      {children}
    </div>
  );
};

export default VideoBackground;
