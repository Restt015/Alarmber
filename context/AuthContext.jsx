import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on app start
    useEffect(() => {
        // We explicitly DON'T check auth here to force welcome screen
        // checkAuth(); 
        setLoading(false);
    }, []);

    const checkAuth = async () => {
        try {
            setLoading(true);
            const token = await authService.getToken();
            if (token) {
                const userData = await authService.getUser();
                if (userData) {
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    // Si no hay datos de usuario, limpiar todo
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            setUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await authService.register(name, email, password);
            setUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Siempre limpiar el estado, incluso si hay error
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    };

    const updateUser = async (userData) => {
        try {
            const updatedUser = await authService.updateProfile(userData);
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        refreshUser: checkAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
