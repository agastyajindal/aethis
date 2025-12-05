import { motion } from 'framer-motion';

interface AuroraProps {
  className?: string;
  colors?: string[];
  speed?: number;
  blur?: number;
  opacity?: number;
}

const Aurora: React.FC<AuroraProps> = ({
  className = '',
  colors = ['#D76D77', '#7BE1A4', '#979BFF', '#ffca7b'],
  speed = 10,
  blur = 100,
  opacity = 0.3,
}) => {
  return (
    <div
      className={`aurora-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {colors.map((color, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            filter: `blur(${blur}px)`,
            opacity,
          }}
          animate={{
            x: [
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
            ],
            y: [
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
            ],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: speed + index * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default Aurora;
