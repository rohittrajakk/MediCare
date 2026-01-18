import { motion } from 'framer-motion';
import styled from 'styled-components';

const Card3DWrapper = styled(motion.div)`
  background: ${props => props.$gradient || 'var(--bg-card)'};
  border-radius: var(--radius-xl);
  padding: ${props => props.$padding || '1.5rem'};
  border: 1px solid var(--gray-100);
  transform-style: preserve-3d;
  perspective: 1000px;
  position: relative;
  overflow: hidden;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
`;

const Card3D = ({ 
  children, 
  gradient, 
  padding, 
  onClick, 
  className,
  tiltIntensity = 5,
  glowColor = 'rgba(99, 102, 241, 0.3)',
  ...props 
}) => {
  return (
    <Card3DWrapper
      $gradient={gradient}
      $padding={padding}
      $clickable={!!onClick}
      className={className}
      onClick={onClick}
      whileHover={{ 
        rotateX: tiltIntensity,
        rotateY: -tiltIntensity,
        translateZ: 10,
        boxShadow: `20px 20px 60px rgba(0, 0, 0, 0.1), 0 0 40px ${glowColor}`
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
      {...props}
    >
      {children}
    </Card3DWrapper>
  );
};

export default Card3D;
