import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AnimatedNumber = ({ 
  value, 
  duration = 1500, 
  prefix = '', 
  suffix = '',
  className,
  style
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          animateValue();
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  const animateValue = () => {
    const numericValue = parseFloat(value) || 0;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = numericValue * easeOut;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(numericValue);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const formatValue = (val) => {
    // Check if value has decimal places
    if (Number.isInteger(parseFloat(value))) {
      return Math.floor(val);
    }
    return val.toFixed(1);
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{formatValue(displayValue)}{suffix}
    </motion.span>
  );
};

export default AnimatedNumber;
