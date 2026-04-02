import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import axios from 'axios';
import API_CONFIG from '../../utils/apiConfig';
import '../../styles/user-profile.css';
import BottomNav from '../../components/BottomNav';

import { useAuth } from '../../contexts/AuthContext';

const ViewUserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { role } = useAuth();
    const location = useLocation();
    const { openConversation } = useChat();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleBack = () => {
        if (location.state?.fromChat && location.state?.conversation) {
            openConversation(location.state.conversation);
        }
        navigate(-1);
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_CONFIG.BASE_URL}/api/auth/user/public-profile/${id}`, {
                    withCredentials: true
                });
                setUser(response.data.user);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching public profile:', error);
                setLoading(false);
            }
        };

        if (id) fetchUserProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="user-profile-page">
                <div style={{ color: '#888', textAlign: 'center', marginTop: '100px' }}>
                    <p>Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="user-profile-page">
                <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px', padding: '20px' }}>
                    <h3>User Not Found</h3>
                    <button className="btn-primary" onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-profile-page view-only" style={{ background: '#000', minHeight: '100vh', position: 'relative' }}>
            <div style={{ 
                height: '160px', width: '100%', background: 'linear-gradient(180deg, #1e3a8a 0%, #000 100%)',
                opacity: 0.3, position: 'absolute', top: 0, zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '500px', margin: '0 auto', paddingBottom: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '20px', position: 'sticky', top: 0 }}>
                    <button onClick={handleBack} style={{
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff', cursor: 'pointer', backdropFilter: 'blur(10px)'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <span style={{ marginLeft: '16px', fontWeight: '700', fontSize: '18px', color: '#fff' }}>Profile</span>
                </div>

                <div className="user-profile-card" style={{ background: 'transparent', boxShadow: 'none', marginTop: '0', paddingTop: '10px' }}>
                    <div className="user-profile-avatar-container">
                        <div style={{ position: 'relative' }}>
                            <img src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'} alt="Avatar" className="user-profile-avatar" style={{ width: '120px', height: '120px', borderWidth: '4px', borderColor: '#3498db' }} />
                            <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '16px', height: '16px', background: '#10b981', border: '3px solid #111', borderRadius: '50%' }} />
                        </div>
                    </div>
                    
                    <div className="user-profile-info" style={{ gap: '12px', textAlign: 'center' }}>
                        <h2 className="user-profile-name" style={{ fontSize: '28px' }}>{user.fullName}</h2>
                        
                        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '100px', color: '#3498db', fontWeight: '700', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 auto' }}>
                             Active Client
                        </div>
                        
                        <div className="user-profile-location" style={{ opacity: 0.7, justifyContent: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            <span>{user.location || 'Location not set'}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                            <div style={{ background: '#111', padding: '16px', borderRadius: '16px', border: '1px solid #222', textAlign: 'left' }}>
                                <span style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800' }}>Habit</span>
                                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '4px 0 0' }}>{user.foodHabits || 'Not set'}</p>
                            </div>
                            <div style={{ background: '#111', padding: '16px', borderRadius: '16px', border: '1px solid #222', textAlign: 'left' }}>
                                <span style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800' }}>Vibe</span>
                                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '4px 0 0' }}>{user.foodTaste || 'Authentic'}</p>
                            </div>
                        </div>

                        <div className="user-profile-tags" style={{ marginTop: '10px' }}>
                            {user.interests?.map((interest, index) => (
                                <span key={index} className="user-tag" style={{ background: '#111', borderColor: '#222' }}>{interest}</span>
                            ))}
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            <button className="btn-primary" style={{ width: '100%', padding: '18px', borderRadius: '18px', fontSize: '16px', fontWeight: '700', boxShadow: '0 8px 24px rgba(52, 152, 219, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={handleBack}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                                Message Client
                            </button>
                        </div>

                        <div style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.08) 0%, rgba(0,0,0,0) 100%)', borderRadius: '20px', border: '1px solid rgba(52, 152, 219, 0.15)', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '18px' }}>💡</span>
                                <strong style={{ color: '#3498db', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Partner Tip</strong>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', color: '#888', lineHeight: '1.6' }}>
                                Recommend dishes matching their {user.foodTaste || 'authentic'} taste.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
                <BottomNav />
            </div>
        </div>
    );
};

export default ViewUserProfile;
