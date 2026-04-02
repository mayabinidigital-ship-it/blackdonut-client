import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [isInboxOpen, setIsInboxOpen] = useState(false);
    const [activeConversation, setActiveConversation] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const openInbox = () => setIsInboxOpen(true);
    const closeInbox = () => {
        setIsInboxOpen(false);
        setActiveConversation(null);
    };

    const openConversation = (conv) => {
        setActiveConversation(conv);
        setIsInboxOpen(true);
    };

    const closeConversation = () => {
        setActiveConversation(null);
    };

    return (
        <ChatContext.Provider value={{ 
            isInboxOpen, 
            setIsInboxOpen, 
            activeConversation, 
            setActiveConversation,
            unreadCount,
            setUnreadCount,
            openInbox,
            closeInbox,
            openConversation,
            closeConversation
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
