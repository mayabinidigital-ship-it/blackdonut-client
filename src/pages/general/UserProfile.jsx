import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../../utils/apiConfig';
import '../../styles/user-profile.css';
import { createNotification } from '../../utils/axiosSetup';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // Form states
    const [fullName, setFullName] = useState('');
    const [location, setLocation] = useState('');
    const [avatar, setAvatar] = useState('');
    const [foodHabits, setFoodHabits] = useState('');
    const [foodTaste, setFoodTaste] = useState('');
    const [interests, setInterests] = useState(''); 

    const navigate = useNavigate();

    const avatars = [
        'https://cdn-icons-png.flaticon.com/512/4140/4140037.png',
        'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
        'https://cdn-icons-png.flaticon.com/512/4140/4140051.png',
        'https://cdn-icons-png.flaticon.com/512/4140/4140047.png',
        'https://cdn-icons-png.flaticon.com/512/147/147144.png',
        'https://cdn-icons-png.flaticon.com/512/147/147142.png',
        'https://cdn-icons-png.flaticon.com/512/145/145843.png',
        'https://cdn-icons-png.flaticon.com/512/145/145847.png',
        'https://cdn-icons-png.flaticon.com/512/145/145848.png',
        'https://cdn-icons-png.flaticon.com/512/145/145849.png'
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.USER_PROFILE}`, {
                withCredentials: true
            });
            const userData = response.data.user;
            setUser(userData);
            setFullName(userData.fullName || '');
            setLocation(userData.location || '');
            setAvatar(userData.avatar || avatars[0]);
            setFoodHabits(userData.foodHabits || '');
            setFoodTaste(userData.foodTaste || '');
            setInterests(userData.interests?.join(', ') || '');
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
            if (error.response?.status === 401) {
                navigate('/user/login');
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const response = await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.UPDATE_USER_PROFILE}`, {
                fullName,
                location,
                avatar,
                foodHabits,
                foodTaste,
                interests: interests.split(',').map(i => i.trim()).filter(i => i !== '')
            }, { withCredentials: true });
            
            setUser(response.data.user);
            setIsEditing(false);
            createNotification('Profile updated successfully!', 'success');
        } catch (error) {
            createNotification('Failed to update profile.', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.USER_LOGOUT}`, {
                withCredentials: true
            });
            window.location.href = '/user/login';
        } catch (error) {
            createNotification('Failed to logout.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="user-profile-page">
                <div style={{ textAlign: 'center', padding: '100px 20px', color: '#888' }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="user-profile-page">
            <div className="user-profile-card">
                {!isEditing ? (
                    <>
                        <div className="user-profile-avatar-container">
                            <img src={avatar} alt="Profile Avatar" className="user-profile-avatar" />
                        </div>
                        <div className="user-profile-info">
                            <h2 className="user-profile-name">{user.fullName}</h2>
                            <p className="user-profile-email">{user.email}</p>
                            
                            <div className="user-profile-location">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>{user.location || 'Location not set'}</span>
                            </div>

                            <div className="user-profile-tags">
                                {user.foodHabits && <span className="user-tag accent">{user.foodHabits}</span>}
                                {user.foodTaste && <span className="user-tag accent">{user.foodTaste} Style</span>}
                                {user.interests?.map((interest, index) => (
                                    <span key={index} className="user-tag">{interest}</span>
                                ))}
                            </div>
                            
                            <div className="user-profile-actions">
                                <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                                <button className="btn-outline" onClick={() => setIsSettingsOpen(true)}>Settings</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <form className="edit-form" onSubmit={handleUpdate}>
                        <div className="form-group" style={{ textAlign: 'center' }}>
                            <label>Choose Avatar</label>
                            <img src={avatar} alt="Avatar" className="user-profile-avatar" style={{ width: '80px', height: '80px', marginBottom: '16px' }} />
                            <div className="avatar-grid">
                                {avatars.map((url, i) => (
                                    <img key={i} src={url} alt="Option" className={`avatar-option ${avatar === url ? 'selected' : ''}`} onClick={() => setAvatar(url)} />
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label>Food Habit</label>
                                <select value={foodHabits} onChange={(e) => setFoodHabits(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                                    <option value="Vegetarian">Vegetarian</option>
                                    <option value="Vegan">Vegan</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Taste</label>
                                <select value={foodTaste} onChange={(e) => setFoodTaste(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Authentic">Authentic</option>
                                    <option value="Modern">Modern</option>
                                    <option value="Spicy">Spicy</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Interests</label>
                            <textarea value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. Street food, Desserts" rows="2" />
                        </div>

                        <div className="user-profile-actions">
                            <button className="btn-primary" type="submit" disabled={updating}>{updating ? 'Saving...' : 'Save Changes'}</button>
                            <button className="btn-outline" type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>

            {showLogoutConfirm && (
                <div className="profile-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="confirm-logout-dialog">
                            <h3>Ready to leave?</h3>
                            <p style={{ color: '#888', marginTop: '10px', marginBottom: '30px' }}>Are you sure you want to log out of your account?</p>
                            <div className="dialog-actions" style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                                <button className="btn-danger" style={{ flex: 1 }} onClick={handleLogout}>Log Out</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Sheet */}
            {isSettingsOpen && (
                <div className="profile-modal-overlay" onClick={() => setIsSettingsOpen(false)}>
                    <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="settings-list">
                            <h3>Settings</h3>
                            <div className="settings-item" onClick={() => { setShowLogoutConfirm(true); setIsSettingsOpen(false); }} style={{ marginTop: '15px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                <span style={{ color: '#dc2626', marginLeft: '10px' }}>Log Out Account</span>
                            </div>
                            <button className="btn-primary" style={{ marginTop: '20px', width: '100%' }} onClick={() => setIsSettingsOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            <BottomNav roleLabel="user" />
        </div>
    );
};

export default UserProfile;
