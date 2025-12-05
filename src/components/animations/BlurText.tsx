import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: {
    filter?: string;
    opacity?: number;
    y?: number;
  };
  animationTo?: {
    filter?: string;
    opacity?: number;
    y?: number;
  };
}

const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 0.05,
  className = '',
  animateBy = 'words',
  direction = 'bottom',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: rootMargin, amount: threshold });

  const defaultFrom = {
    filter: 'blur(10px)',
    opacity: 0,
    y: direction === 'bottom' ? 20 : -20,
  };

  const defaultTo = {
    filter: 'blur(0px)',
    opacity: 1,
    y: 0,
  };

  const from = animationFrom || defaultFrom;
  const to = animationTo || defaultTo;

  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  return (
    <p ref={ref} className={`blur-text ${className}`} style={{ display: 'flex', flexWrap: 'wrap' }}>
      {elements.map((element, index) => (
        <motion.span
          key={index}
          initial={from}
          animate={isInView ? to : from}
          transition={{
            duration: 0.5,
            delay: index * delay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{
            display: 'inline-block',
            marginRight: animateBy === 'words' ? '0.3em' : '0',
            whiteSpace: 'pre',
          }}
        >
          {element}
        </motion.span>
      ))}
    </p>
  );
};

export default BlurText;
