import React, { useState, useEffect, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import '../styles/bottom-nav.css'
import '../styles/chat.css'
import API_CONFIG from '../utils/apiConfig'
import ChatInbox from './chat/ChatInbox'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'

const BottomNav = () => {
  const { role: authRole, loading: authLoading } = useAuth()
  const { socket } = useSocket()
  const { isInboxOpen, setIsInboxOpen, unreadCount, setUnreadCount } = useChat()

  const roleLabel = authRole || 'user';

  const fetchUnread = useCallback(async () => {
    if (authLoading || !authRole) return;
    try {
      const endpoint = roleLabel === 'user'
        ? API_CONFIG.ENDPOINTS.CHAT.USER_CONVERSATIONS
        : API_CONFIG.ENDPOINTS.CHAT.PARTNER_CONVERSATIONS
      const res = await axios.get(`${API_CONFIG.BASE_URL}${endpoint}`, {
        withCredentials: true
      })
      const convs = res.data.conversations || []
      const total = convs.reduce((acc, c) =>
        acc + (roleLabel === 'user' ? (c.unreadByUser || 0) : (c.unreadByPartner || 0)), 0)
      setUnreadCount(total)
    } catch (_) { /* session might be ended */ }
  }, [authLoading, authRole, roleLabel, setUnreadCount])

  useEffect(() => {
    fetchUnread()
    
    if (!socket) {
      const interval = setInterval(fetchUnread, 30000)
      return () => clearInterval(interval)
    }

    const onNewMsg = (msg) => {
      // If we're the receiver and the inbox is closed OR it's not the active conversation, increment
      // Actually, just refetch unread is safer and easier
      fetchUnread()
    }

    const onAllSeen = () => fetchUnread()

    socket.on('message:new', onNewMsg)
    socket.on('message:allSeen', onAllSeen)

    return () => {
      socket.off('message:new', onNewMsg)
      socket.off('message:allSeen', onAllSeen)
    }
  }, [socket, fetchUnread])

  return (
    <>
      <nav className="bottom-nav" role="navigation" aria-label="Bottom">
        <div className="bottom-nav__inner">
          <NavLink to="/home" className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
            <span className="bottom-nav__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10.5 12 3l9 7.5"/>
                <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/>
              </svg>
            </span>
            <span className="bottom-nav__label">Home</span>
          </NavLink>

          <NavLink to="/saved" className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
            <span className="bottom-nav__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>
              </svg>
            </span>
            <span className="bottom-nav__label">Saved</span>
          </NavLink>

          <div className="bottom-bar-logo" aria-hidden="true">
            <img src="/bottombardonot.png" alt="" className="bottom-bar-donut" aria-hidden="true" />
          </div>

          {/* Messages icon */}
          <button
            id="bottom-nav-messages-btn"
            className={`bottom-nav__item ${isInboxOpen ? 'is-active' : ''}`}
            onClick={() => {
              setIsInboxOpen(true);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
            aria-label="Messages"
          >
            <span className="bottom-nav__icon" aria-hidden="true" style={{ position: 'relative' }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {unreadCount > 0 && (
                <span className="bottom-nav__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </span>
            <span className="bottom-nav__label">Messages</span>
          </button>
          
          {/* Profile link for partner / user */}
          <NavLink to={roleLabel === 'foodPartner' ? "/food-partner/profile" : "/user/profile"} className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
            <span className="bottom-nav__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            <span className="bottom-nav__label">{roleLabel === 'foodPartner' ? 'Dashboard' : 'Profile'}</span>
          </NavLink>
        </div>
      </nav>

      {/* Chat panel (only mounts when open) */}
      {isInboxOpen && (
        <ChatInbox
          roleLabel={roleLabel}
          onClose={() => setIsInboxOpen(false)}
        />
      )}
    </>
  )
}

export default BottomNav
