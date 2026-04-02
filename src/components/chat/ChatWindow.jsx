import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_CONFIG from '../../utils/apiConfig'
import { useSocket } from '../../contexts/SocketContext'
import { useChat } from '../../contexts/ChatContext'
import '../../styles/chat.css'

// ── Tick icons ────────────────────────────────────────────────────────────
const TickIcon = ({ status }) => {
    if (status === 'seen') {
        return (
            <span className="msg-tick msg-tick--seen" title="Seen">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 13 6 18 14 6" />
                    <polyline points="8 13 13 18 21 6" />
                </svg>
            </span>
        )
    }
    if (status === 'delivered') {
        return (
            <span className="msg-tick msg-tick--delivered" title="Delivered">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 13 6 18 14 6" />
                    <polyline points="8 13 13 18 21 6" />
                </svg>
            </span>
        )
    }
    return (
        <span className="msg-tick msg-tick--sent" title="Sent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="5 12 10 17 20 7" />
            </svg>
        </span>
    )
}

// ── Format timestamp ───────────────────────────────────────────────────────
function formatTime(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDateLabel(dateStr) {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── ChatWindow ─────────────────────────────────────────────────────────────
const ChatWindow = ({ conversation, roleLabel, onClose, onlineUsers }) => {
    const navigate = useNavigate()
    const { socket, reconnect } = useSocket()
    const { setIsInboxOpen } = useChat()
    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [convStatus, setConvStatus] = useState(conversation.status)
    const [showMenu, setShowMenu] = useState(false)
    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)
    const inputRef = useRef(null)
    const menuRef = useRef(null)
    const convId = conversation._id


    const otherName = roleLabel === 'user'
        ? conversation.foodPartner?.name || 'Food Partner'
        : conversation.user?.fullName || 'User'

    const otherAvatar = roleLabel === 'user'
        ? conversation.foodPartner?.profileImage
        : conversation.user?.avatar

    const isBlocked = convStatus === 'rejected' || convStatus === 'restricted'

    // ── Close menu on outside click ─────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false)
            }
        }
        if (showMenu) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showMenu])

    // ── Restrict / Unrestrict ───────────────────────────────────────
    const handleRestrict = async () => {
        try {
            const res = await axios.put(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT.RESTRICT(convId)}`,
                {},
                { withCredentials: true }
            )
            setConvStatus(res.data.conversation.status)
            setShowMenu(false)
        } catch (e) {
            console.error('restrict error', e)
        }
    }
    const isPending = convStatus === 'pending' && roleLabel === 'user'

    // ── Load messages ──────────────────────────────────────────────────
    const loadMessages = useCallback(async () => {
        try {
            const endpoint = roleLabel === 'user'
                ? API_CONFIG.ENDPOINTS.CHAT.GET_MESSAGES(convId)
                : API_CONFIG.ENDPOINTS.CHAT.PARTNER_MESSAGES(convId)

            const res = await axios.get(`${API_CONFIG.BASE_URL}${endpoint}`, {
                withCredentials: true
            })
            setMessages(res.data.messages || [])
        } catch (e) {
            console.error('❌ loadMessages error:', e.response?.data || e.message)
        }
    }, [convId, roleLabel])

    // ── Socket events ──────────────────────────────────────────────────
    useEffect(() => {
        loadMessages()

        if (!socket) return

        socket.emit('join:conversation', { conversationId: convId })

        // Immediately mark as seen
        socket.emit('message:seen', { conversationId: convId })

        const onNewMsg = (msg) => {
            if (msg.conversationId !== convId) return
            setMessages(prev => {
                if (prev.find(m => m._id === msg._id)) return prev
                return [...prev, msg]
            })
            // Mark seen
            socket.emit('message:seen', { conversationId: convId })
        }

        const onDelivered = ({ messageId }) => {
            setMessages(prev => prev.map(m =>
                m._id === messageId ? { ...m, status: 'delivered' } : m
            ))
        }

        const onBulkDelivered = () => {
            setMessages(prev => prev.map(m =>
                m.status === 'sent' ? { ...m, status: 'delivered' } : m
            ))
        }

        const onAllSeen = ({ seenBy }) => {
            if (seenBy !== roleLabel) {
                setMessages(prev => prev.map(m =>
                    m.senderType === roleLabel ? { ...m, status: 'seen' } : m
                ))
            }
        }

        const onTypingStart = ({ senderType }) => {
            if (senderType !== roleLabel) setIsTyping(true)
        }

        const onTypingStop = ({ senderType }) => {
            if (senderType !== roleLabel) setIsTyping(false)
        }

        socket.on('message:new', onNewMsg)
        socket.on('message:delivered', onDelivered)
        socket.on('message:bulkDelivered', onBulkDelivered)
        socket.on('message:allSeen', onAllSeen)
        socket.on('typing:start', onTypingStart)
        socket.on('typing:stop', onTypingStop)

        return () => {
            socket.off('message:new', onNewMsg)
            socket.off('message:delivered', onDelivered)
            socket.off('message:bulkDelivered', onBulkDelivered)
            socket.off('message:allSeen', onAllSeen)
            socket.off('typing:start', onTypingStart)
            socket.off('typing:stop', onTypingStop)
        }
    }, [socket, convId, loadMessages, roleLabel])

    // ── Scroll to bottom ──────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    // ── Send message ──────────────────────────────────────────────────
    const sendMessage = () => {
        const text = inputText.trim()

        if (!text) return;
        if (!socket) {
            console.error('❌ Cannot send: Socket is NULL. Attempting to reconnect...');
            return;
        }
        if (isBlocked) {
            console.error('❌ Cannot send: Conversation is BLOCKED (rejected/restricted)');
            return;
        }

        socket.emit('message:send', { conversationId: convId, message: text })
        setInputText('')
        inputRef.current?.focus()

        // Stop typing
        socket.emit('typing:stop', { conversationId: convId })
        clearTimeout(typingTimeoutRef.current)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const handleInput = (e) => {
        setInputText(e.target.value)
        if (!socket) return

        socket.emit('typing:start', { conversationId: convId })
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing:stop', { conversationId: convId })
        }, 1500)
    }

    // ── Render messages with date groups ──────────────────────────────
    const renderMessages = () => {
        let lastDate = null
        return messages.map((msg) => {
            const msgDate = formatDateLabel(msg.createdAt)
            const showDate = msgDate !== lastDate
            lastDate = msgDate
            const isSent = msg.senderType === roleLabel

            return (
                <React.Fragment key={msg._id}>
                    {showDate && (
                        <div className="chat-date-divider">{msgDate}</div>
                    )}
                    <div className={`msg-row msg-row--${isSent ? 'sent' : 'received'}`}>
                        <div className={`msg-bubble msg-bubble--${isSent ? 'sent' : 'received'}`}>
                            <span className="msg-bubble__text">{msg.message}</span>
                            <div className="msg-bubble__meta">
                                <span className="msg-bubble__time">{formatTime(msg.createdAt)}</span>
                                {isSent && <TickIcon status={msg.status} />}
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            )
        })
    }

    const avatarSrc = otherAvatar
        ? (String(otherAvatar).startsWith('http') ? otherAvatar : `${API_CONFIG.BASE_URL}/${otherAvatar}`)
        : null

    const otherId = roleLabel === 'user'
        ? (conversation.foodPartner?._id || conversation.foodPartnerId)
        : (conversation.user?._id || conversation.userId)

    const isOtherOnline = onlineUsers?.has(String(otherId))

    return (
        <div className="chat-window">
            {/* Header */}
            <div className="chat-window__header">
                <button className="chat-window__back" onClick={onClose} aria-label="Back">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <div
                    onClick={() => {
                        const cleanId = String(otherId).trim();
                        const path = roleLabel === 'user' ? `/food-partner/${cleanId}` : `/profile/user/${cleanId}`

                        // Close inbox so it doesn't show up on the next page (if it has BottomNav)
                        setIsInboxOpen?.(false);

                        // Navigate with state
                        navigate(path, { state: { fromChat: true, conversation: conversation } });
                    }}
                    className="chat-window__header-link"
                    style={{ cursor: 'pointer' }}
                >
                    {avatarSrc
                        ? <img className="chat-window__avatar" src={avatarSrc} alt={otherName} />
                        : (
                            <div className="chat-window__avatar-placeholder">
                                {otherName[0]}
                            </div>
                        )
                    }

                    <div className="chat-window__info">
                        <p className="chat-window__name">{otherName}</p>
                        <p className="chat-window__sub">{roleLabel === 'user' ? 'Food Partner' : 'Client'}</p>
                        {isOtherOnline && <p className="chat-window__online">●  Online</p>}
                    </div>
                </div>

                {/* 3-dots menu */}
                <div className="chat-window__menu-wrapper" ref={menuRef}>
                    <button
                        className="chat-window__menu-btn"
                        onClick={() => setShowMenu(prev => !prev)}
                        aria-label="More options"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                        </svg>
                    </button>

                    {showMenu && (
                        <div className="chat-window__dropdown">
                            {roleLabel === 'foodPartner' && (
                                <button className="chat-window__dropdown-item chat-window__dropdown-item--danger" onClick={handleRestrict}>
                                    {convStatus === 'restricted' ? ' Unrestrict' : ' Restrict'}
                                </button>
                            )}
                            {roleLabel === 'user' && (
                                <button className="chat-window__dropdown-item chat-window__dropdown-item--danger" onClick={handleRestrict}>
                                    {convStatus === 'restricted' ? ' Unblock' : ' Block'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Pending banner (user side) */}
            {isPending && (
                <div className="chat-pending-banner">
                    ⏳ Your message request is waiting for approval.
                    You can send your first message below.
                </div>
            )}

            {/* Messages */}
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="chat-empty-state">
                        <div className="chat-empty-icon">👋</div>
                        <h3 className="chat-empty-title">Say hello to {otherName}</h3>
                        <p className="chat-empty-text">
                            {isPending
                                ? "Send a message request to start the conversation. Once they accept, you can chat freely."
                                : "Start your conversation by sending a message below."}
                        </p>
                        {isPending && (
                            <button
                                className="chat-init-request-btn"
                                onClick={() => {
                                    let activeSocket = socket;
                                    if (!activeSocket && typeof reconnect === 'function') {
                                        activeSocket = reconnect();
                                    }

                                    const text = "Hello! I'd like to chat with you.";
                                    if (activeSocket && !isBlocked) {
                                        activeSocket.emit('message:send', { conversationId: convId, message: text });
                                        setInputText('');
                                    } else {
                                        console.error('❌ Request failed: socket still null or blocked.');
                                    }
                                }}
                            >
                                Send Message Request
                            </button>
                        )}
                    </div>
                )}
                {renderMessages()}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="typing-indicator">
                        <div className="typing-dots">
                            <span /><span /><span />
                        </div>
                        <span>{otherName} is typing…</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Blocked banner */}
            {isBlocked ? (
                <div className="chat-blocked-banner">
                    {convStatus === 'rejected'
                        ? '🚫 This conversation was declined by the Food Partner.'
                        : '🔒 You have been restricted from messaging this partner.'}
                </div>
            ) : (
                <div className="chat-input-bar">
                    <textarea
                        ref={inputRef}
                        className="chat-input"
                        placeholder="Message…"
                        value={inputText}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={sendMessage}
                        disabled={!inputText.trim()}
                        aria-label="Send"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    )
}

export default ChatWindow
