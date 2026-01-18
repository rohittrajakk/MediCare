import { useState, useEffect } from 'react';
import { patientApi, doctorApi, recordApi, vitalsApi } from '../services/api';
import styled, { keyframes, css } from 'styled-components';

// ============================================
// KEYFRAME ANIMATIONS
// ============================================
const pulse = keyframes`
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.3)); }
  50% { transform: scale(1.03); filter: drop-shadow(0 0 30px rgba(239, 68, 68, 0.5)); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const ecgDash = keyframes`
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

// ============================================
// PREMIUM COLOR PALETTE
// ============================================
const colors = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#ec4899',
  accent: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  dark: '#0f172a',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  glassBg: 'rgba(255, 255, 255, 0.7)',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
};

// ============================================
// MAIN LAYOUT
// ============================================
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1c2e 0%, #16213e 50%, #0f0c29 100%);
  padding: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 40%);
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1500px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

// ============================================
// HEADER
// ============================================
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(-5px);
  }
  
  svg {
    width: 18px;
    height: 18px;
    transition: transform 0.3s;
  }
  
  &:hover svg { transform: translateX(-3px); }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const LastUpdated = styled.span`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  
  span { color: rgba(255, 255, 255, 0.9); font-weight: 500; }
`;

const ScheduleBtn = styled.button`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  background-size: 200% 200%;
  animation: ${gradientShift} 3s ease infinite;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(99, 102, 241, 0.5);
  }
`;

// ============================================
// PATIENT CARD (GLASSMORPHISM)
// ============================================
const PatientCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 1.75rem 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  animation: ${fadeInUp} 0.6s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.accent} 0%, #f97316 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
  animation: ${floatAnimation} 3s ease-in-out infinite;
`;

const PatientInfo = styled.div`
  flex: 0 0 auto;
  min-width: 220px;
  
  h2 {
    margin: 0 0 0.3rem 0;
    font-size: 1.6rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
`;

const IconBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  ${props => props.$primary ? css`
    background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  ` : css`
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}
  
  &:hover {
    transform: scale(1.1);
  }
`;

const DownloadBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`;

// ============================================
// DISORDERS SECTION
// ============================================
const DisordersBox = styled.div`
  flex: 1;
  padding-left: 2rem;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
`;

const DisordersTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const DisorderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  
  .label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.82rem;
    min-width: 120px;
  }
`;

const Tag = styled.span`
  background: ${props => props.$bg || 'rgba(245, 158, 11, 0.2)'};
  color: ${props => props.$color || '#fbbf24'};
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
  backdrop-filter: blur(5px);
  border: 1px solid ${props => props.$border || 'rgba(245, 158, 11, 0.3)'};
`;

// ============================================
// MAIN GRID
// ============================================
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr 340px;
  gap: 1.5rem;
  animation: ${fadeInUp} 0.7s ease-out;
  
  @media (max-width: 1280px) {
    grid-template-columns: 300px 1fr 300px;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

// ============================================
// GLASS CARD
// ============================================
const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  
  .icon {
    font-size: 1.1rem;
  }
`;

// ============================================
// VITAL ROWS
// ============================================
const VitalRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  margin-bottom: 0.6rem;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateX(5px);
  }
  
  &:last-child { margin-bottom: 0; }
`;

const VitalIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: ${props => props.$bg || 'rgba(239, 68, 68, 0.15)'};
  color: ${props => props.$color || '#f87171'};
  box-shadow: 0 4px 15px ${props => props.$shadow || 'rgba(239, 68, 68, 0.2)'};
`;

const VitalData = styled.div`
  flex: 1;
  
  .label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0.15rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    
    span {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 400;
      margin-left: 0.25rem;
    }
  }
`;

const EcgWrapper = styled.div`
  width: 70px;
  height: 32px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  
  svg {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    transform: translateY(-50%);
    
    path {
      stroke: #f87171;
      stroke-width: 2;
      fill: none;
      stroke-linecap: round;
      stroke-dasharray: 100;
      animation: ${ecgDash} 1.5s linear infinite;
    }
  }
`;

// ============================================
// BLOOD SUGAR GAUGE
// ============================================
const GaugeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
`;

const CircularGauge = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(
    ${colors.accent} 0deg ${props => Math.min((props.$value / 200) * 360, 360)}deg,
    rgba(255, 255, 255, 0.1) ${props => Math.min((props.$value / 200) * 360, 360)}deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    width: 110px;
    height: 110px;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 50%;
  }
`;

const GaugeValue = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  
  .value {
    font-size: 2rem;
    font-weight: 800;
    color: white;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .unit {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 0.1rem;
  }
  
  .time {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 0.2rem;
  }
`;

// ============================================
// VITAL CARD WITH GRAPH
// ============================================
const VitalCard = styled.div`
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1rem 1.25rem;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
`;

const VitalCardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
  
  .icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
  }
  
  .title {
    flex: 1;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .main-val {
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
  }
  
  .trend {
    font-size: 0.7rem;
    color: ${colors.danger};
    margin-left: 0.25rem;
  }
`;

const GraphRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MiniGraph = styled.div`
  flex: 1;
  height: 45px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    ${props => props.$color}15 30%, 
    ${props => props.$color}25 50%, 
    ${props => props.$color}15 70%, 
    transparent 100%
  );
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 5%;
    right: 5%;
    height: 2px;
    background: ${props => props.$color};
    clip-path: polygon(
      0% 50%, 5% 30%, 10% 60%, 15% 25%, 20% 75%, 25% 15%, 30% 85%, 
      35% 40%, 40% 60%, 45% 35%, 50% 65%, 55% 20%, 60% 80%, 65% 45%, 
      70% 55%, 75% 30%, 80% 70%, 85% 40%, 90% 60%, 95% 35%, 100% 50%
    );
    filter: drop-shadow(0 0 4px ${props => props.$color});
  }
`;

const ValueBadge = styled.div`
  background: linear-gradient(135deg, ${props => props.$bg || colors.primary} 0%, ${props => props.$bg2 || colors.primaryDark} 100%);
  color: white;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1rem;
  text-align: center;
  min-width: 55px;
  box-shadow: 0 4px 15px ${props => props.$shadow || 'rgba(99, 102, 241, 0.4)'};
  
  .small {
    font-size: 0.6rem;
    font-weight: 500;
    opacity: 0.9;
    margin-top: 0.1rem;
  }
`;

// ============================================
// DOCTOR CARDS
// ============================================
const DoctorCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1rem;
  background: ${props => props.$active ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1.5px solid ${props => props.$active ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 16px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateX(5px);
  }
`;

const DocAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
`;

const DocInfo = styled.div`
  flex: 1;
  min-width: 0;
  
  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: white;
  }
  
  .specialty {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.5);
    margin: 0.15rem 0;
  }
  
  .avail {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;

const DocActions = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-top: 0.6rem;
`;

const MiniBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const RatingBadge = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  padding: 0.25rem 0.55rem;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

// ============================================
// MEDICATIONS
// ============================================
const MedItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  margin-bottom: 0.6rem;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const MedInfo = styled.div`
  .name {
    font-weight: 600;
    font-size: 0.9rem;
    color: white;
  }
  
  .dosage {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.15rem;
  }
`;

const MedStatus = styled.div`
  text-align: right;
  
  .status {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.$adherent ? colors.success : colors.danger};
  }
  
  .date {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 0.1rem;
  }
`;

// ============================================
// CENTER - HEART VISUALIZATION
// ============================================
const CenterPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 500px;
`;

const Breadcrumb = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 1rem;
  
  span {
    color: ${colors.primary};
    font-weight: 600;
  }
`;

const OrganSelector = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const OrganBtn = styled.button`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  border: 2px solid ${props => props.$active ? colors.primary : 'rgba(255, 255, 255, 0.1)'};
  background: ${props => props.$active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$active ? colors.primary : 'rgba(255, 255, 255, 0.5)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: ${colors.primary};
    color: ${colors.primary};
    transform: scale(1.1);
  }
`;

const HeartContainer = styled.div`
  position: relative;
  width: 320px;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BodyGlow = styled.div`
  position: absolute;
  width: 250px;
  height: 350px;
  background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  border-radius: 50% 50% 45% 45%;
  filter: blur(20px);
`;

const HeartSvg = styled.div`
  position: relative;
  z-index: 2;
  width: 160px;
  height: 160px;
  animation: ${pulse} 1.8s ease-in-out infinite;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const ZoomBtns = styled.div`
  position: absolute;
  bottom: 10px;
  display: flex;
  gap: 0.6rem;
  
  button {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    }
  }
`;

// ============================================
// EDIT MODAL
// ============================================
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2rem;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
  
  h3 {
    margin: 0;
    font-size: 1.3rem;
    color: white;
    font-weight: 700;
  }
  
  button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    color: white;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover { background: rgba(255, 255, 255, 0.15); }
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  
  label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  input {
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-size: 1rem;
    color: white;
    transition: all 0.3s;
    
    &:focus {
      outline: none;
      border-color: ${colors.primary};
      background: rgba(99, 102, 241, 0.1);
    }
    
    &::placeholder { color: rgba(255, 255, 255, 0.3); }
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover { background: rgba(255, 255, 255, 0.15); }
`;

const SaveBtn = styled.button`
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
  }
`;

// ============================================
// HEART SVG COMPONENT
// ============================================
const HeartIconSvg = () => (
  <svg viewBox="0 0 100 100">
    <defs>
      <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="50%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
      <linearGradient id="aortaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path d="M50 90 C15 60 0 40 0 25 C0 10 12 0 28 0 C40 0 50 10 50 10 C50 10 60 0 72 0 C88 0 100 10 100 25 C100 40 85 60 50 90Z" fill="url(#heartGrad)" filter="url(#glow)" />
    <path d="M38 10 C38 -2 62 -2 62 10 L62 5 C70 5 76 12 76 22 L62 22 L62 18 C62 12 56 8 50 8 C44 8 38 12 38 18 L38 22 L24 22 C24 12 30 5 38 5 Z" fill="url(#aortaGrad)" />
    <path d="M30 30 L30 55" stroke="#991b1b" strokeWidth="1.5" fill="none" opacity="0.4" />
    <path d="M50 25 L50 65" stroke="#991b1b" strokeWidth="1.5" fill="none" opacity="0.4" />
    <path d="M70 30 L70 55" stroke="#991b1b" strokeWidth="1.5" fill="none" opacity="0.4" />
    <path d="M15 22 C5 28 3 45 12 58" stroke="#1e40af" strokeWidth="3" fill="none" />
    <path d="M85 22 C95 28 97 45 88 58" stroke="#dc2626" strokeWidth="3" fill="none" />
  </svg>
);

// ============================================
// MAIN COMPONENT
// ============================================
function MedicalRecords({ user, userType }) {
    const [loading, setLoading] = useState(true);
    const [vitals, setVitals] = useState({});
    const [records, setRecords] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedOrgan, setSelectedOrgan] = useState('heart');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        fetchAllData();
    }, [user?.id]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch vitals from backend
            const vitalsRes = await vitalsApi.getDashboard(user.id);
            if (vitalsRes.data.success && vitalsRes.data.data) {
                setVitals(vitalsRes.data.data);
            }

            // Fetch records
            const recordsRes = await patientApi.getRecords(user.id);
            if (recordsRes.data.success) {
                setRecords(recordsRes.data.data || []);
            }

            // Fetch doctors
            try {
                const docRes = await doctorApi.getAll();
                if (docRes.data.success) {
                    setDoctors((docRes.data.data || []).slice(0, 2));
                }
            } catch {
                // Fallback doctors
                setDoctors([
                    { name: 'Sarah Miller', specialization: 'Cardiologist', rating: 4.9 },
                    { name: 'James Wilson', specialization: 'General Physician', rating: 4.7 }
                ]);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditVitals = () => {
        setEditData({
            heartRate: vitals.heartRate || 74,
            systolicBP: vitals.bloodPressure?.split('/')[0] || 120,
            diastolicBP: vitals.bloodPressure?.split('/')[1] || 80,
            temperature: vitals.temperature || 36.6,
            oxygenSaturation: vitals.oxygenSaturation || 97,
            bloodGlucose: vitals.bloodGlucose || 126,
            cholesterol: vitals.cholesterol || 225
        });
        setShowEditModal(true);
    };

    const handleSaveVitals = async () => {
        try {
            await vitalsApi.addManual(user.id, {
                systolicBP: parseInt(editData.systolicBP),
                diastolicBP: parseInt(editData.diastolicBP),
                heartRate: parseInt(editData.heartRate),
                temperature: parseFloat(editData.temperature),
                oxygenSaturation: parseInt(editData.oxygenSaturation),
                bloodGlucose: parseInt(editData.bloodGlucose),
                dataSource: 'DOCTOR',
                recordedBy: 'Doctor'
            });
            setShowEditModal(false);
            fetchAllData();
        } catch (err) {
            console.error('Save error:', err);
        }
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
    const formatDate = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // BACKEND DATA WITH FALLBACKS
    const heartRate = vitals.heartRate || 78;
    const bp = vitals.bloodPressure || '118/76';
    const temp = vitals.temperature || 36.8;
    const spo2 = vitals.oxygenSaturation || 98;
    const glucose = vitals.bloodGlucose || 105;
    const cholesterol = vitals.cholesterol || 195;
    const hemoglobin = vitals.hemoglobin || 14.2;

    if (loading) {
        return (
            <PageWrapper>
                <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>❤️</div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>Loading your health data...</p>
                    </div>
                </Container>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <Container>
                {/* HEADER */}
                <Header>
                    <BackButton onClick={() => window.history.back()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Patient Details
                    </BackButton>
                    <HeaderRight>
                        <LastUpdated>Last updated on <span>{formatDate()}</span></LastUpdated>
                        <ScheduleBtn>Schedule a Visit</ScheduleBtn>
                    </HeaderRight>
                </Header>

                {/* PATIENT CARD */}
                <PatientCard>
                    <Avatar>{getInitials(user?.name)}</Avatar>
                    <PatientInfo>
                        <h2>{user?.name || 'Patient'}</h2>
                        <p>{user?.gender || 'Not specified'}, {user?.age || '—'} years</p>
                        <ActionButtons>
                            <IconBtn $primary>📞</IconBtn>
                            <IconBtn>💬</IconBtn>
                            <DownloadBtn>📥 Download Record</DownloadBtn>
                        </ActionButtons>
                    </PatientInfo>
                    <DisordersBox>
                        <DisordersTitle>Disorders</DisordersTitle>
                        <DisorderRow>
                            <span className="label">Cardiomyopathies:</span>
                            <Tag>Dilated Cardiomyopathy</Tag>
                        </DisorderRow>
                        <DisorderRow>
                            <span className="label">Arrhythmias:</span>
                            <Tag $bg="rgba(239, 68, 68, 0.15)" $color="#f87171" $border="rgba(239, 68, 68, 0.3)">Atrial Fibrillation</Tag>
                            <Tag $bg="rgba(239, 68, 68, 0.15)" $color="#f87171" $border="rgba(239, 68, 68, 0.3)">Bradycardia</Tag>
                        </DisorderRow>
                        <DisorderRow>
                            <span className="label">Aortic Diseases:</span>
                            <Tag $bg="rgba(59, 130, 246, 0.15)" $color="#60a5fa" $border="rgba(59, 130, 246, 0.3)">Aortic Aneurysm</Tag>
                            <Tag $bg="rgba(59, 130, 246, 0.15)" $color="#60a5fa" $border="rgba(59, 130, 246, 0.3)">Aortic Dissection</Tag>
                        </DisorderRow>
                    </DisordersBox>
                </PatientCard>

                {/* MAIN GRID */}
                <MainGrid>
                    {/* LEFT PANEL */}
                    <Panel>
                        <GlassCard>
                            <CardHeader>
                                <CardTitle><span className="icon">❤️</span> Heart Status</CardTitle>
                                {userType === 'doctor' && (
                                    <IconBtn onClick={handleEditVitals} style={{ width: 32, height: 32, fontSize: '0.8rem' }}>✏️</IconBtn>
                                )}
                            </CardHeader>
                            
                            <VitalRow>
                                <VitalIcon $bg="rgba(239, 68, 68, 0.15)" $color="#f87171" $shadow="rgba(239, 68, 68, 0.2)">💓</VitalIcon>
                                <VitalData>
                                    <div className="label">Heart Rate</div>
                                    <div className="value">{heartRate}<span>bpm</span></div>
                                </VitalData>
                                <EcgWrapper>
                                    <svg viewBox="0 0 70 32">
                                        <path d="M0 16 L15 16 L18 8 L22 24 L26 4 L30 28 L34 16 L55 16 L58 10 L62 22 L66 6 L70 16" />
                                    </svg>
                                </EcgWrapper>
                            </VitalRow>

                            <VitalRow>
                                <VitalIcon $bg="rgba(236, 72, 153, 0.15)" $color="#f472b6" $shadow="rgba(236, 72, 153, 0.2)">🩸</VitalIcon>
                                <VitalData>
                                    <div className="label">Blood Count</div>
                                    <div className="value">80-90</div>
                                </VitalData>
                            </VitalRow>

                            <VitalRow>
                                <VitalIcon $bg="rgba(245, 158, 11, 0.15)" $color="#fbbf24" $shadow="rgba(245, 158, 11, 0.2)">💧</VitalIcon>
                                <VitalData>
                                    <div className="label">Cholesterol</div>
                                    <div className="value">{cholesterol}<span>mg/dL</span></div>
                                </VitalData>
                            </VitalRow>

                            <VitalRow>
                                <VitalIcon $bg="rgba(59, 130, 246, 0.15)" $color="#60a5fa" $shadow="rgba(59, 130, 246, 0.2)">🩺</VitalIcon>
                                <VitalData>
                                    <div className="label">Blood Glucose Level</div>
                                    <div className="value">{glucose}<span>mg/dL</span></div>
                                </VitalData>
                            </VitalRow>

                            <VitalRow>
                                <VitalIcon $bg="rgba(16, 185, 129, 0.15)" $color="#34d399" $shadow="rgba(16, 185, 129, 0.2)">🫁</VitalIcon>
                                <VitalData>
                                    <div className="label">Saturation</div>
                                    <div className="value">{spo2}<span>%</span></div>
                                </VitalData>
                            </VitalRow>
                        </GlassCard>

                        {/* AVAILABLE DOCTORS */}
                        <GlassCard>
                            <CardTitle>Available Doctors</CardTitle>
                            {doctors.map((doc, i) => (
                                <DoctorCard key={i} $active={i === 0}>
                                    <DocAvatar>{getInitials(doc.name)}</DocAvatar>
                                    <DocInfo>
                                        <h4>Dr. {doc.name}</h4>
                                        <p className="specialty">{doc.specialization}</p>
                                        <p className="avail">🕐 Available: 9:00 AM - 6:00 PM</p>
                                        <DocActions>
                                            <MiniBtn>📞</MiniBtn>
                                            <MiniBtn>💬</MiniBtn>
                                            <MiniBtn>📹</MiniBtn>
                                        </DocActions>
                                    </DocInfo>
                                    <RatingBadge>⭐ {doc.rating}</RatingBadge>
                                </DoctorCard>
                            ))}
                        </GlassCard>

                        {/* MEDICATIONS */}
                        <GlassCard>
                            <CardHeader>
                                <CardTitle>💊 Medications</CardTitle>
                            </CardHeader>
                            <MedItem>
                                <MedInfo>
                                    <div className="name">Metformin 500mg</div>
                                    <div className="dosage">Twice daily after meals</div>
                                </MedInfo>
                                <MedStatus $adherent>
                                    <div className="status">✓ Adherent</div>
                                    <div className="date">Since: 01/12/2024</div>
                                </MedStatus>
                            </MedItem>
                            <MedItem>
                                <MedInfo>
                                    <div className="name">Lisinopril 10mg</div>
                                    <div className="dosage">Once daily morning</div>
                                </MedInfo>
                                <MedStatus $adherent>
                                    <div className="status">✓ Adherent</div>
                                    <div className="date">Since: 15/11/2024</div>
                                </MedStatus>
                            </MedItem>
                        </GlassCard>
                    </Panel>

                    {/* CENTER PANEL */}
                    <CenterPanel>
                        <Breadcrumb>Full Body / <span>Heart Details</span></Breadcrumb>
                        <OrganSelector>
                            <OrganBtn $active={selectedOrgan === 'brain'} onClick={() => setSelectedOrgan('brain')}>🧠</OrganBtn>
                            <OrganBtn $active={selectedOrgan === 'heart'} onClick={() => setSelectedOrgan('heart')}>❤️</OrganBtn>
                            <OrganBtn $active={selectedOrgan === 'kidneys'} onClick={() => setSelectedOrgan('kidneys')}>🫘</OrganBtn>
                            <OrganBtn $active={selectedOrgan === 'lungs'} onClick={() => setSelectedOrgan('lungs')}>🫁</OrganBtn>
                        </OrganSelector>
                        <HeartContainer>
                            <BodyGlow />
                            <HeartSvg><HeartIconSvg /></HeartSvg>
                        </HeartContainer>
                        <ZoomBtns>
                            <button>−</button>
                            <button>+</button>
                        </ZoomBtns>
                    </CenterPanel>

                    {/* RIGHT PANEL */}
                    <Panel>
                        {/* BLOOD SUGAR GAUGE */}
                        <GlassCard>
                            <CardTitle>Blood Sugar</CardTitle>
                            <GaugeContainer>
                                <CircularGauge $value={glucose}>
                                    <GaugeValue>
                                        <div className="value">{glucose}</div>
                                        <div className="unit">mg/dL</div>
                                        <div className="time">(Today)</div>
                                    </GaugeValue>
                                </CircularGauge>
                            </GaugeContainer>
                        </GlassCard>

                        {/* VITAL SIGNS */}
                        <GlassCard>
                            <CardTitle>Vital Signs</CardTitle>
                            <VitalRow>
                                <VitalIcon $bg="rgba(239, 68, 68, 0.15)" $color="#f87171">🩸</VitalIcon>
                                <VitalData>
                                    <div className="label">Blood Pressure</div>
                                    <div className="value">{bp}<span>mmHg</span></div>
                                </VitalData>
                            </VitalRow>
                            <VitalRow>
                                <VitalIcon $bg="rgba(245, 158, 11, 0.15)" $color="#fbbf24">🌡️</VitalIcon>
                                <VitalData>
                                    <div className="label">Body Temperature</div>
                                    <div className="value">{temp}<span>°C</span></div>
                                </VitalData>
                            </VitalRow>
                            <VitalRow>
                                <VitalIcon $bg="rgba(236, 72, 153, 0.15)" $color="#f472b6">❤️</VitalIcon>
                                <VitalData>
                                    <div className="label">Oxygen Saturation (SpO2)</div>
                                    <div className="value">{spo2}<span>%</span></div>
                                </VitalData>
                            </VitalRow>
                        </GlassCard>

                        {/* VITAL CARDS WITH GRAPHS */}
                        <VitalCard>
                            <VitalCardTop>
                                <div className="icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>📊</div>
                                <span className="title">Heart Rate</span>
                                <span className="main-val">{heartRate} bpm</span>
                                <span className="trend">▲</span>
                            </VitalCardTop>
                            <GraphRow>
                                <MiniGraph $color="#6366f1" />
                                <ValueBadge $bg="#6366f1" $bg2="#4f46e5" $shadow="rgba(99, 102, 241, 0.4)">
                                    {heartRate}
                                    <div className="small">bpm</div>
                                </ValueBadge>
                            </GraphRow>
                        </VitalCard>

                        <VitalCard>
                            <VitalCardTop>
                                <div className="icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>📈</div>
                                <span className="title">Blood Sugar</span>
                                <span className="main-val">120/160 mg/dL</span>
                            </VitalCardTop>
                            <GraphRow>
                                <MiniGraph $color="#f59e0b" />
                                <ValueBadge $bg="#f59e0b" $bg2="#d97706" $shadow="rgba(245, 158, 11, 0.4)">
                                    {glucose}
                                    <div className="small">mg/dL</div>
                                </ValueBadge>
                            </GraphRow>
                        </VitalCard>

                        <VitalCard>
                            <VitalCardTop>
                                <div className="icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>📉</div>
                                <span className="title">Blood Pressure</span>
                                <span className="main-val">{bp}</span>
                            </VitalCardTop>
                            <GraphRow>
                                <MiniGraph $color="#3b82f6" />
                                <ValueBadge $bg="#3b82f6" $bg2="#2563eb" $shadow="rgba(59, 130, 246, 0.4)">
                                    {bp.split('/')[0]}
                                    <div className="small">/{bp.split('/')[1]}</div>
                                </ValueBadge>
                            </GraphRow>
                        </VitalCard>
                    </Panel>
                </MainGrid>

                {/* EDIT MODAL */}
                {showEditModal && (
                    <ModalOverlay onClick={() => setShowEditModal(false)}>
                        <ModalContent onClick={e => e.stopPropagation()}>
                            <ModalHeader>
                                <h3>Edit Patient Vitals</h3>
                                <button onClick={() => setShowEditModal(false)}>✕</button>
                            </ModalHeader>
                            <FormGrid>
                                <FormGroup>
                                    <label>Heart Rate (bpm)</label>
                                    <input type="number" value={editData.heartRate} onChange={e => setEditData({...editData, heartRate: e.target.value})} />
                                </FormGroup>
                                <FormGroup>
                                    <label>Temperature (°C)</label>
                                    <input type="number" step="0.1" value={editData.temperature} onChange={e => setEditData({...editData, temperature: e.target.value})} />
                                </FormGroup>
                                <FormGroup>
                                    <label>Systolic BP (mmHg)</label>
                                    <input type="number" value={editData.systolicBP} onChange={e => setEditData({...editData, systolicBP: e.target.value})} />
                                </FormGroup>
                                <FormGroup>
                                    <label>Diastolic BP (mmHg)</label>
                                    <input type="number" value={editData.diastolicBP} onChange={e => setEditData({...editData, diastolicBP: e.target.value})} />
                                </FormGroup>
                                <FormGroup>
                                    <label>Oxygen Saturation (%)</label>
                                    <input type="number" value={editData.oxygenSaturation} onChange={e => setEditData({...editData, oxygenSaturation: e.target.value})} />
                                </FormGroup>
                                <FormGroup>
                                    <label>Blood Glucose (mg/dL)</label>
                                    <input type="number" value={editData.bloodGlucose} onChange={e => setEditData({...editData, bloodGlucose: e.target.value})} />
                                </FormGroup>
                            </FormGrid>
                            <ModalActions>
                                <CancelBtn onClick={() => setShowEditModal(false)}>Cancel</CancelBtn>
                                <SaveBtn onClick={handleSaveVitals}>Save Changes</SaveBtn>
                            </ModalActions>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </Container>
        </PageWrapper>
    );
}

export default MedicalRecords;
