import { useState, useEffect } from 'react';
import { patientApi } from '../services/api';
import styled from 'styled-components';
import { FaUser, FaSave } from 'react-icons/fa';

// Styled Components
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
  p {
    color: #64748b;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #475569;
  }

  input, select, textarea {
    padding: 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.1s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: ${props => props.type === 'error' ? '#fef2f2' : '#f0fdf4'};
  color: ${props => props.type === 'error' ? '#ef4444' : '#16a34a'};
  border: 1px solid ${props => props.type === 'error' ? '#fee2e2' : '#bbf7d0'};
`;

function ProfileSettings({ user, onUserUpdate }) {
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '', email: '', phone: '', age: '', gender: '', 
        bloodGroup: '', address: '', emergencyContact: '', password: ''
    });

    useEffect(() => {
        fetchProfile();
    }, [user?.id]);

    const fetchProfile = async () => {
        if (!user?.id) return;
        try {
            const response = await patientApi.getById(user.id);
            if (response.data.success) {
                const data = response.data.data;
                setProfileData({
                    ...data,
                    password: '' // Don't show password
                });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load profile' });
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...profileData, age: parseInt(profileData.age) };
            if (!payload.password) delete payload.password;

            const response = await patientApi.update(user.id, payload);
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                if (onUserUpdate) onUserUpdate(response.data.data);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <Header>
                <h1>Profile Settings</h1>
                <p>Manage your personal information and account security</p>
            </Header>

            {message.text && (
                <StatusMessage type={message.type}>
                    {message.text}
                </StatusMessage>
            )}

            <Card>
                <form onSubmit={handleProfileSubmit}>
                    <SectionTitle>Personal Information</SectionTitle>
                    <FormGrid>
                        <FormGroup>
                            <label>Full Name</label>
                            <input 
                                value={profileData.name || ''} 
                                onChange={e => setProfileData({...profileData, name: e.target.value})} 
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={profileData.email || ''} 
                                onChange={e => setProfileData({...profileData, email: e.target.value})} 
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>Phone</label>
                            <input 
                                value={profileData.phone || ''} 
                                onChange={e => setProfileData({...profileData, phone: e.target.value})} 
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>Age</label>
                            <input 
                                type="number" 
                                value={profileData.age || ''} 
                                onChange={e => setProfileData({...profileData, age: e.target.value})} 
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>Gender</label>
                            <select 
                                value={profileData.gender || ''} 
                                onChange={e => setProfileData({...profileData, gender: e.target.value})}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </FormGroup>
                        <FormGroup>
                            <label>Blood Group</label>
                            <input 
                                value={profileData.bloodGroup || ''} 
                                onChange={e => setProfileData({...profileData, bloodGroup: e.target.value})} 
                            />
                        </FormGroup>
                    </FormGrid>

                    <SectionTitle>Address & Emergency</SectionTitle>
                    <FormGrid>
                        <FormGroup>
                            <label>Address</label>
                            <input 
                                value={profileData.address || ''} 
                                onChange={e => setProfileData({...profileData, address: e.target.value})} 
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>Emergency Contact</label>
                            <input 
                                value={profileData.emergencyContact || ''} 
                                onChange={e => setProfileData({...profileData, emergencyContact: e.target.value})} 
                            />
                        </FormGroup>
                    </FormGrid>
                    
                    <SectionTitle>Security</SectionTitle>
                    <FormGrid>
                            <FormGroup>
                            <label>New Password (leave blank to keep current)</label>
                            <input 
                                type="password"
                                value={profileData.password || ''} 
                                onChange={e => setProfileData({...profileData, password: e.target.value})} 
                            />
                        </FormGroup>
                    </FormGrid>

                    <Button type="submit" disabled={loading}>
                        <FaSave /> {loading ? 'Saving...' : 'Save Profile'}
                    </Button>
                </form>
            </Card>
        </PageContainer>
    );
}

export default ProfileSettings;
