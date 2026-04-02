import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../utils/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            // First check if user is logged in
            const userRes = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.USER_PROFILE}`, { withCredentials: true });
            if (userRes.data?.user) {
                setUser(userRes.data.user);
                setRole('user');
                setLoading(false);
                return;
            }
        } catch (_) { /* ignore */ }

        try {
            // Then check if partner is logged in
            const partnerRes = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOOD_PARTNER.GET_ME}`, { withCredentials: true });
            if (partnerRes.data?.foodPartner) {
                setUser(partnerRes.data.foodPartner);
                setRole('foodPartner');
                setLoading(false);
                return;
            }
        } catch (_) { /* ignore */ }

        setUser(null);
        setRole(null);
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
