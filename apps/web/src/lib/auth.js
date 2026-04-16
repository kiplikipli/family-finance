import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        }
        catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);
    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { accessToken, refreshToken, user: userData } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(userData);
    };
    const logout = () => {
        api.post('/auth/logout').catch(() => { });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };
    return (<AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
