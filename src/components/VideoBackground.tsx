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
      {/* Video Background */}
      {videoSrc && (
        <motion.video
          className="absolute inset-0 w-full h-full object-cover"
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
            backgroundRepeat: 'no-repeat'
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
            objectFit: 'cover'
          }}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
      )}
      
      {/* Overlay for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, hsl(${overlayColor} / ${overlayOpacity + 0.2}) 0%, hsl(${overlayColor} / ${overlayOpacity}) 40%, transparent 70%)`
        }}
      />
      
      {children}
    </div>
  );
};

export default VideoBackground;