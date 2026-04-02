import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import API_CONFIG from '../utils/apiConfig'

export const SocketContext = createContext(null)

export const useSocket = () => {
    const context = useContext(SocketContext)
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider')
    }
    return context
}

export const SocketProvider = ({ children }) => {
    const { user, loading } = useAuth()
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState(new Set())

    const connect = () => {
        if (socket) {
            return socket
        }

        const s = io(API_CONFIG.BASE_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            timeout: 20000, 
        })

        s.on('connect', () => {
            setIsConnected(true)
        })

        s.on('disconnect', (reason) => {
            setIsConnected(false)
        })

        s.on('connect_error', (err) => {
            console.error('âŒ Socket connection error:', err.message)
            if (err.message === 'No token provided' || err.message === 'Invalid token') {
                setIsConnected(false)
            }
        })

        s.on('user:online', ({ id }) => {
            setOnlineUsers(prev => new Set([...prev, id]))
        })

        s.on('user:offline', ({ id }) => {
            setOnlineUsers(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        })

        setSocket(s)
        return s
    }

    const disconnect = () => {
        if (socket) {
            socket.disconnect()
            setSocket(null)
            setIsConnected(false)
        }
    }

    useEffect(() => {
        if (loading) return

        if (user) {
            connect()
        } else {
            disconnect()
        }
        
        return () => {
            // Socket lifecycle is tied to auth session
        }
    }, [user, loading])

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers, reconnect: connect, disconnect }}>
            {children}
        </SocketContext.Provider>
    )
}
