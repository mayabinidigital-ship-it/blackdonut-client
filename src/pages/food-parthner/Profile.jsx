import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import API_CONFIG from '../../utils/apiConfig'
import '../../styles/profile.css'
import '../../styles/logo-responsive.css'
import '../../styles/chat.css'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useChat } from '../../contexts/ChatContext'
import axios from 'axios'
import ChatWindow from '../../components/chat/ChatWindow'

const Profile = () => {
    const { id } = useParams()
    const [ profile, setProfile ] = useState(null)
    const [ videos, setVideos ] = useState([])
    const joinBtnRef = useRef(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { openConversation } = useChat()

    const handleBack = () => {
        if (location.state?.fromChat && location.state?.conversation) {
            openConversation(location.state.conversation);
        }
        navigate(-1);
    }

    // Chat state
    const [chatConv, setChatConv] = useState(null)
    const [chatLoading, setChatLoading] = useState(false)
    const [convStatus, setConvStatus] = useState(null) // 'pending', 'accepted', 'rejected', etc.

    useEffect(() => {
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOOD_PARTNER.GET_BY_ID(id)}`, { withCredentials: true })
            .then(response => {
                setProfile(response.data.foodPartner)
                setVideos(response.data.foodPartner.foodItems || [])
            })

        // Check if user has a conversation with this partner
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.GET_STATUS(id)}`, { withCredentials: true })
            .then(res => setConvStatus(res.data.status))
            .catch(() => {}) // Ignore if not logged in
    }, [ id ])

    // compute avatar src (handles full url, relative filename, or missing)
    const avatarSrc = profile?.profileImage
        ? (String(profile.profileImage).startsWith('http')
            ? profile.profileImage
            : `${API_CONFIG.BASE_URL}/${profile.profileImage}`)
        : 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'

    const totalMealsDisplay = videos.length

    const handleOpenChat = async () => {
        setChatLoading(true)
        try {
            const res = await axios.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.INIT_CONVERSATION(id)}`,
                {},
                { withCredentials: true }
            )
            // Attach display info
            const conv = {
                ...res.data.conversation,
                foodPartner: {
                    _id: id,
                    name: profile?.name,
                    profileImage: profile?.profileImage
                }
            }
            setChatConv(conv)
            setConvStatus(conv.status)
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/user/login')
            }
        } finally {
            setChatLoading(false)
        }
    }

    return (
        <main className="profile-page">
            {/* Back button */}
            <button
                onClick={handleBack}
                aria-label="Back"
                style={{
                    position: 'fixed',
                    left: 20,
                    top: 20,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: '#1e6aff',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    fontSize: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 40
                }}
            >
                ←
            </button>

            <section className="profile-header">
                {/* Left action: note + small join button placed inside top-left corner of header box */}
                <div className="profile-left-action">
                    <p className="join-note">Be a foodparthner</p>
                    <button
                        ref={joinBtnRef}
                        onClick={() => {
                            const btn = joinBtnRef.current
                            if (btn && typeof gsap !== 'undefined') {
                                gsap.fromTo(btn, { scale: 1 }, { scale: 0.92, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' })
                                setTimeout(() => navigate('/food-partner/login'), 160)
                            } else if (btn) {
                                btn.classList.add('opacity-90')
                                setTimeout(() => btn.classList.remove('opacity-90'), 140)
                                navigate('/food-partner/login')
                            } else {
                                navigate('/food-partner/login')
                            }
                        }}
                        className="join-button"
                        aria-label="Join as a food Parthner"
                    >
                        Join
                    </button>
                </div>

                <div className="profile-meta">

                    {/* fixed: use JS expression for src and provide a fallback */}
                    <img
                      className="profile-avatar"
                      src={avatarSrc}
                      alt={profile?.name ? `${profile.name} avatar` : 'Profile avatar'}
                    />

                    <div className="profile-info">
                        <h1 className="profile-pill profile-business" title="Business name">
                            {profile?.name}
                        </h1>
                        <p className="profile-pill profile-address" title="Address" style={{ marginBottom: '8px' }}>
                            {profile?.address}
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '4px' }}>
                            <span style={{ color: '#666' }}>Owner: </span>
                            {profile?.contactName || 'No contact name set'}
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '12px' }}>
                            <span style={{ color: '#666' }}>Phone: </span>
                            {profile?.phone || 'No phone set'}
                        </p>

                        {/* Chat button */}
                        <button
                            id="profile-chat-btn"
                            className="chat-trigger-btn"
                            onClick={handleOpenChat}
                            disabled={chatLoading}
                            aria-label="Chat with this food partner"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            {chatLoading ? 'Opening…' : (convStatus === 'pending' ? 'Request Sent' : (convStatus === 'accepted' ? 'Open Chat' : 'Send Request'))}
                        </button>
                    </div>
                </div>

                <div className="profile-stats" role="list" aria-label="Stats">
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">total meals</span>
                        <span className="profile-stat-value">{totalMealsDisplay}</span>
                    </div>
                    <div className="profile-stat" role="listitem">
                        <span className="profile-stat-label">customer served</span>
                        <span className="profile-stat-value">{profile?.customerServed ?? 0}</span>
                    </div>
                </div>
            </section>

            <hr className="profile-sep" />

            <section className="profile-grid" aria-label="Videos">
                {(videos || []).map((v, index) => (
                    <div 
                        key={v.id || v._id} 
                        className="profile-grid-item"
                        onClick={() => navigate(`/food-partner/${id}/reel/${index}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* Video tile */}
                        <video
                            className="profile-grid-video"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            src={v.video}
                            muted
                        ></video>
                    </div>
                ))}
            </section>

            {/* Copyright Footer - Desktop Only */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    fontSize: '0.75rem',
                    color: '#666',
                    zIndex: 5
                }}
                className="desktop-only"
            >
                {String.fromCharCode(...[169, 32, 50, 48, 50, 53, 32, 83, 97, 110, 106, 105, 98, 32, 75, 117, 109, 97, 114, 32, 68, 101, 107, 97, 32, 8212, 32, 65, 108, 108, 32, 82, 105, 103, 104, 116, 115, 32, 82, 101, 115, 101, 114, 118, 101, 100])}
            </div>

            {/* Chat window */}
            {chatConv && (
                <ChatWindow
                    conversation={chatConv}
                    roleLabel="user"
                    onlineUsers={new Set()}
                    onClose={() => setChatConv(null)}
                />
            )}
        </main>
    )
} 

export default Profile
