import React, { useEffect, useState, useCallback, useContext } from 'react'
import axios from 'axios'
import API_CONFIG from '../../utils/apiConfig'
import ChatWindow from './ChatWindow'
import { useSocket } from '../../contexts/SocketContext'
import '../../styles/chat.css'
import { useChat } from '../../contexts/ChatContext'

// Format last-message time
function formatRelativeTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// ── ConvItem (single conversation row) ────────────────────────────────────
const ConvItem = ({ conv, roleLabel, onClick, onAccept, onReject, onRestrict }) => {
    const name = roleLabel === 'user'
        ? conv.foodPartner?.name || 'Food Partner'
        : conv.user?.fullName || 'User'

    const avatarSrc = roleLabel === 'user' && conv.foodPartner?.profileImage
        ? (String(conv.foodPartner.profileImage).startsWith('http')
            ? conv.foodPartner.profileImage
            : `${API_CONFIG.BASE_URL}/${conv.foodPartner.profileImage}`)
        : null

    const unread = roleLabel === 'user' ? conv.unreadByUser : conv.unreadByPartner

    return (
        <div className="conv-item" onClick={onClick}>
            {avatarSrc
                ? <img className="conv-item__avatar" src={avatarSrc} alt={name} />
                : (
                    <div className="conv-item__avatar--placeholder">
                        {name[0]?.toUpperCase()}
                    </div>
                )
            }

            <div className="conv-item__body">
                <p className="conv-item__name">{name}</p>
                <p className={`conv-item__preview ${unread > 0 ? 'unread' : ''}`}>
                    {conv.lastMessage || 'Start a conversation'}
                </p>

                {roleLabel === 'foodPartner' && conv.status === 'pending' && (
                    <div className="conv-item__actions" onClick={e => e.stopPropagation()}>
                        <button
                            className="conv-action-btn conv-action-btn--accept"
                            onClick={() => onAccept(conv._id)}
                        >Accept</button>
                        <button
                            className="conv-action-btn conv-action-btn--reject"
                            onClick={() => onReject(conv._id)}
                        >Decline</button>
                    </div>
                )}

            </div>

            <div className="conv-item__meta">
                <span className="conv-item__time">{formatRelativeTime(conv.lastMessageAt)}</span>
                {unread > 0 && <span className="conv-item__badge">{unread}</span>}
                {conv.status === 'pending' && roleLabel === 'user' && (
                    <span className="conv-item__status conv-item__status--pending">Pending</span>
                )}
                {conv.status === 'rejected' && (
                    <span className="conv-item__status conv-item__status--rejected">Declined</span>
                )}
                {conv.status === 'restricted' && roleLabel === 'user' && (
                    <span className="conv-item__status conv-item__status--restricted">Restricted</span>
                )}
            </div>
        </div>
    )
}

// ── ChatInbox (main inbox panel) ──────────────────────────────────────────
const ChatInbox = ({ roleLabel, onClose }) => {
    const { socket, onlineUsers } = useSocket()
    const { activeConversation: activeConv, setActiveConversation: setActiveConv } = useChat()
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('all')


    const fetchConversations = useCallback(async () => {
        if (!roleLabel) return;
        try {
            const endpoint = roleLabel === 'user'
                ? API_CONFIG.ENDPOINTS.CHAT.USER_CONVERSATIONS
                : API_CONFIG.ENDPOINTS.CHAT.PARTNER_CONVERSATIONS

            const res = await axios.get(`${API_CONFIG.BASE_URL}${endpoint}`, {
                withCredentials: true
            })
            setConversations(res.data.conversations || [])
        } catch (e) {
            console.error('fetchConversations error', e)
        } finally {
            setLoading(false)
        }
    }, [roleLabel])

    useEffect(() => {
        if (roleLabel) {
            fetchConversations()
        }
    }, [fetchConversations, roleLabel])

    useEffect(() => {
        if (!socket) return

        const onNewMsg = (msg) => {
            setConversations(prev => {
                const updated = prev.map(c => {
                    if (c._id === msg.conversationId) {
                        const unreadKey = roleLabel === 'user' ? 'unreadByUser' : 'unreadByPartner'
                        const increment = msg.senderType !== roleLabel ? 1 : 0
                        return {
                            ...c,
                            lastMessage: msg.message,
                            lastMessageAt: msg.createdAt,
                            [unreadKey]: (c[unreadKey] || 0) + increment
                        }
                    }
                    return c
                })
                return [...updated].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
            })
        }

        const onAllSeen = ({ conversationId }) => {
            setConversations(prev => prev.map(c => {
                if (c._id === conversationId) {
                    const unreadKey = roleLabel === 'user' ? 'unreadByUser' : 'unreadByPartner'
                    return { ...c, [unreadKey]: 0 }
                }
                return c
            }))
        }

        socket.on('message:new', onNewMsg)
        socket.on('message:allSeen', onAllSeen)

        return () => {
            socket.off('message:new', onNewMsg)
            socket.off('message:allSeen', onAllSeen)
        }
    }, [socket, roleLabel])

    const handleAccept = async (convId) => {
        try {
            await axios.put(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.ACCEPT(convId)}`,
                {},
                { withCredentials: true }
            )
            setConversations(prev => prev.map(c =>
                c._id === convId ? { ...c, status: 'accepted' } : c
            ))
        } catch (e) { console.error('accept error', e) }
    }

    const handleReject = async (convId) => {
        try {
            await axios.put(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.REJECT(convId)}`,
                {},
                { withCredentials: true }
            )
            setConversations(prev => prev.map(c =>
                c._id === convId ? { ...c, status: 'rejected' } : c
            ))
        } catch (e) { console.error('reject error', e) }
    }

    const handleRestrict = async (convId) => {
        try {
            const res = await axios.put(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.RESTRICT(convId)}`,
                {},
                { withCredentials: true }
            )
            setConversations(prev => prev.map(c =>
                c._id === convId ? { ...c, status: res.data.conversation.status } : c
            ))
        } catch (e) { console.error('restrict error', e) }
    }

    const filtered = conversations.filter(c => {
        if (tab === 'all') return true
        if (tab === 'requests') return c.status === 'pending'
        if (tab === 'accepted') return c.status === 'accepted' || c.status === 'restricted'
        return true
    })

    const totalUnread = conversations.reduce((acc, c) => {
        return acc + (roleLabel === 'user' ? (c.unreadByUser || 0) : (c.unreadByPartner || 0))
    }, 0)

    return (
        <>
            <div className="chat-panel-overlay" onClick={onClose} />

            <div className="chat-panel">
                <div className="chat-panel__drag" />

                <div className="chat-panel__header">
                    <h2 className="chat-panel__title">
                        Messages {totalUnread > 0 && `(${totalUnread})`}
                    </h2>
                    <button className="chat-panel__close" onClick={onClose} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="chat-panel__tabs">
                    <button
                        className={`chat-tab ${tab === 'all' ? 'active' : ''}`}
                        onClick={() => setTab('all')}
                    >All</button>
                    <button
                        className={`chat-tab ${tab === 'requests' ? 'active' : ''}`}
                        onClick={() => setTab('requests')}
                    >Requests</button>
                    <button
                        className={`chat-tab ${tab === 'accepted' ? 'active' : ''}`}
                        onClick={() => setTab('accepted')}
                    >Active</button>
                </div>

                <div className="chat-list">
                    {loading ? (
                        <div className="chat-list__empty">
                            <div className="typing-dots">
                                <span /><span /><span />
                            </div>
                            <p>Loading…</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="chat-list__empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        filtered.map(conv => (
                            <ConvItem
                                key={conv._id}
                                conv={conv}
                                roleLabel={roleLabel}
                                onClick={() => {
                                    setActiveConv(conv);
                                }}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                onRestrict={handleRestrict}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Open conversation window */}
            {activeConv && (
                <ChatWindow
                    conversation={activeConv}
                    roleLabel={roleLabel}
                    onlineUsers={onlineUsers}
                    onClose={() => {
                        setActiveConv(null);
                    }}
                />
            )}
        </>
    )
}

export default ChatInbox
