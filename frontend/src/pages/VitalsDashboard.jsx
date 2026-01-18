import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeart, FaLungs, FaBrain, FaTint, FaWeight, FaTemperatureHigh, 
  FaPlus, FaApple, FaGoogle, FaPencilAlt, FaUserMd 
} from 'react-icons/fa';
import { vitalsApi } from '../services/api';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr 380px;
  gap: 2rem;
  padding: 2rem;
  height: calc(100vh - 80px); /* Adjust based on navbar */
  background: #f8fafc;
  overflow: hidden;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    height: auto;
    overflow-y: auto;
  }
`;

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
`;

const LeftPanel = styled(Panel)`
  /* Custom scrollbar if needed */
  overflow-y: auto;
`;

const RightPanel = styled(Panel)`
  background: #fff;
`;

const CenterStage = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, #eef2ff 0%, #f8fafc 70%);
  border-radius: 24px;
`;

const BodyImage = styled(motion.img)`
  height: 85%;
  object-fit: contain;
  filter: drop-shadow(0 10px 30px rgba(99, 102, 241, 0.2));
  cursor: pointer;
`;

const Hotspot = styled(motion.div)`
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(239, 68, 68, 0.6);
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
  cursor: pointer;
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.4);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }
`;

const OrganTile = styled(motion.div)`
  background: ${props => props.active ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' : '#fff'};
  padding: 1.2rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  border: 1px solid ${props => props.active ? 'transparent' : '#e2e8f0'};
  color: ${props => props.active ? '#fff' : '#1e293b'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.05);
  }

  img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
`;

const VitalsCard = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => props.status === 'CRITICAL' ? '#fecaca' : props.status === 'HIGH' ? '#fed7aa' : '#e2e8f0'};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 6px;
    background: ${props => 
      props.status === 'CRITICAL' ? '#ef4444' : 
      props.status === 'HIGH' ? '#f97316' : 
      props.status === 'ELEVATED' ? '#eab308' : '#22c55e'};
  }
`;

const SourceBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.5rem;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 12px;
  width: fit-content;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const VitalsDashboard = ({ user }) => {
    const [selectedOrgan, setSelectedOrgan] = useState('Whole Body');
    const [vitalsData, setVitalsData] = useState({});
    const [conditions, setConditions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData();
        }
    }, [user?.id]);

    const fetchDashboardData = async () => {
        try {
            const response = await vitalsApi.getDashboard(user.id);
            if (response.data.success) {
                const data = response.data.data;
                const mappedData = mapBackendData(data);
                setVitalsData(mappedData);
                setConditions(data.activeConditions || []);
            }
        } catch (error) {
            console.error("Failed to load dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    const mapBackendData = (data) => {
        return {
            'Whole Body': [
                { label: 'Weight', ...data.weight, icon: <FaWeight /> },
                { label: 'Height', ...data.height, icon: <FaWeight /> }, // Icon reuse
                { label: 'Temperature', ...data.temperature, icon: <FaTemperatureHigh /> },
                { label: 'BMI', ...data.bmi, icon: <FaWeight /> },
            ].filter(d => d.value),
            'Heart': [
                { label: 'Heart Rate', ...data.heartRate, icon: <FaHeart /> },
                { label: 'Blood Pressure', ...data.bloodPressure, icon: <FaTint /> },
            ].filter(d => d.value),
            'Lungs': [
                { label: 'O2 Saturation', ...data.oxygenSaturation, icon: <FaLungs /> },
                { label: 'Resp. Rate', ...data.respiratoryRate, icon: <FaLungs /> },
            ].filter(d => d.value),
            'Liver': [
                { label: 'Blood Glucose', ...data.bloodGlucose, icon: <FaTint /> },
                { label: 'Hemoglobin', ...data.hemoglobin, icon: <FaTint /> },
            ].filter(d => d.value)
        };
    };

    const organs = [
        { id: 'Whole Body', icon: '/assets/images/human-body-3d.png', label: 'Whole Body' },
        { id: 'Heart', icon: '/assets/images/heart-3d.png', label: 'Heart' },
        { id: 'Lungs', icon: '/assets/images/lungs-3d.png', label: 'Lungs' },
        { id: 'Liver', icon: '/assets/images/liver-3d.png', label: 'Liver' },
    ];


    return (
        <DashboardContainer>
            {/* LEFT PANEL - ORGAN NAVIGATION */}
            <LeftPanel>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                    <div style={{width: 50, height: 50, borderRadius: '50%', background: '#ddd', overflow: 'hidden'}}>
                         <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="User" width="100%" /> 
                    </div>
                    <div>
                        <h3 style={{margin: 0, fontSize: '1.1rem'}}>{user?.name || 'Loading...'}</h3>
                        <p style={{margin: 0, fontSize: '0.85rem', color: '#64748b'}}>
                            {user?.gender || '--'}, {user?.age || '--'}y
                        </p>
                    </div>
                </div>

                <SectionTitle>My Organs</SectionTitle>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {organs.map(organ => (
                        <OrganTile 
                            key={organ.id} 
                            active={selectedOrgan === organ.id}
                            onClick={() => setSelectedOrgan(organ.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <img src={organ.icon} alt={organ.label} onError={(e) => e.target.style.display = 'none'} /> 
                            {/* Fallback to icon if image fails */} 
                             {!organ.icon && <FaHeart />}
                            <span style={{fontWeight: 600}}>{organ.label}</span>
                            {selectedOrgan === organ.id && <motion.div layoutId="active-dot" style={{marginLeft: 'auto', width: 8, height: 8, background: '#fff', borderRadius: '50%'}} />}
                        </OrganTile>
                    ))}
                </div>

                <div style={{marginTop: 'auto', background: '#ffe4e6', padding: '1.5rem', borderRadius: '20px'}}>
                    <h4 style={{margin: '0 0 0.5rem 0', color: '#be123c', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <FaUserMd /> Disorders
                    </h4>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                        {conditions.length > 0 ? conditions.map((c, i) => (
                             <span key={i} style={{background: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', color: '#be123c'}}>
                                {c}
                             </span>
                        )) : <span style={{fontSize: '0.8rem', color: '#be123c'}}>No active disorders</span>}
                    </div>
                </div>
            </LeftPanel>

            {/* CENTER STAGE - 3D BODY */}
            <CenterStage>
                <BodyImage 
                    src="/assets/images/human-body-3d.png" 
                    alt="3D Body"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                />
                
                {/* Interactive Hotspots - Positioned relative to the image container */}
                {/* Heart Location (Approximate) */}
                <Hotspot 
                    style={{ top: '35%', left: '52%' }} 
                    onClick={() => setSelectedOrgan('Heart')}
                    whileHover={{ scale: 1.2 }}
                />
                {/* Lungs Location */}
                <Hotspot 
                    style={{ top: '30%', left: '45%' }} 
                    onClick={() => setSelectedOrgan('Lungs')}
                />
                 {/* Liver Location */}
                 <Hotspot 
                    style={{ top: '45%', left: '48%' }} 
                    onClick={() => setSelectedOrgan('Liver')}
                />
            </CenterStage>

            {/* RIGHT PANEL - VITALS DETAILS */}
            <RightPanel>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <SectionTitle>{selectedOrgan} Vitals</SectionTitle>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: '#eff6ff', color: '#3b82f6', border: 'none', 
                            padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600
                        }}
                    >
                        <FaPlus style={{marginRight: 6}} /> Add Record
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={selectedOrgan}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}
                    >
                        {vitalsData[selectedOrgan] ? vitalsData[selectedOrgan].map((vital, index) => (
                            <VitalsCard 
                                key={index} 
                                status={vital.status}
                                whileHover={{ y: -4 }}
                            >
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                    <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 500}}>
                                        {vital.icon} {vital.label}
                                    </span>
                                    <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>{vital.date}</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'baseline', gap: '4px'}}>
                                    <span style={{fontSize: '2rem', fontWeight: 800, color: '#1e293b'}}>{vital.value}</span>
                                    <span style={{fontSize: '1rem', color: '#64748b'}}>{vital.unit}</span>
                                </div>
                                <SourceBadge>
                                    {vital.source === 'Apple Health' && <FaApple />}
                                    {vital.source === 'Google Fit' && <FaGoogle />}
                                    {vital.source === 'Manual' && <FaPencilAlt size={10} />}
                                    {vital.source}
                                </SourceBadge>
                            </VitalsCard>
                        )) : (
                            <div style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>
                                No vitals recorded for this area.
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div style={{marginTop: 'auto'}}>
                    <motion.button
                        style={{
                            width: '100%', background: '#1e293b', color: '#fff', 
                            padding: '1rem', borderRadius: '16px', border: 'none', 
                            fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                        }}
                        whileHover={{ scale: 1.02, background: '#334155' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FaUserMd /> Book Consultation
                    </motion.button>
                </div>
            </RightPanel>
        </DashboardContainer>
    );
};

export default VitalsDashboard;
