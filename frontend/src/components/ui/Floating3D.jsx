import { motion } from 'framer-motion';
import styled from 'styled-components';

const FloatingWrapper = styled(motion.div)`
  position: absolute;
  pointer-events: none;
  z-index: ${props => props.$zIndex || 1};
`;

const FloatingImage = styled.img`
  width: ${props => props.$size || '80px'};
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
`;

const Floating3D = ({ 
  src, 
  alt = "3D element",
  size = "80px",
  position = { top: '20%', left: '10%' },
  duration = 4,
  delay = 0,
  rotateRange = 5,
  floatRange = 12,
  zIndex = 1,
  className
}) => {
  return (
    <FloatingWrapper
      $zIndex={zIndex}
      className={className}
      style={position}
      animate={{
        y: [0, -floatRange, 0],
        rotate: [-rotateRange/2, rotateRange/2, -rotateRange/2],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      <FloatingImage 
        src={src} 
        alt={alt}
        $size={size}
      />
    </FloatingWrapper>
  );
};

export default Floating3D;
