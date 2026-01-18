import { motion } from 'framer-motion';
import styled from 'styled-components';

const GlassWrapper = styled(motion.div)`
  background: ${props => props.$strong ? 'var(--glass-bg-strong)' : 'var(--glass-bg)'};
  backdrop-filter: ${props => props.$blur || 'blur(20px)'};
  -webkit-backdrop-filter: ${props => props.$blur || 'blur(20px)'};
  border: 1px solid var(--glass-border);
  border-radius: ${props => props.$radius || 'var(--radius-xl)'};
  padding: ${props => props.$padding || '1.5rem'};
  box-shadow: 
    var(--glass-shadow),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
`;

const InnerGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.8) 50%,
    transparent 100%
  );
  opacity: 0.6;
`;

const GlassCard = ({ 
  children, 
  strong = false,
  blur,
  radius,
  padding,
  showGlow = true,
  className,
  animate = true,
  ...props 
}) => {
  const hoverAnimation = animate ? {
    background: 'var(--glass-bg-strong)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
    y: -2
  } : {};

  return (
    <GlassWrapper
      $strong={strong}
      $blur={blur}
      $radius={radius}
      $padding={padding}
      className={className}
      whileHover={hoverAnimation}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {showGlow && <InnerGlow />}
      {children}
    </GlassWrapper>
  );
};

export default GlassCard;
