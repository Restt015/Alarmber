import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on app start
    useEffect(() => {
        // Enable session restoration for role-based routing
        checkAuth();
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

    // Direct setter for user data - updates state immediately
    const setUserData = (userData) => {
        setUser(userData);
        // Also persist to storage
        if (userData) {
            authService.saveUser(userData);
        }
    };

    // Update user profile - merges with existing data
    const updateUserProfile = async (newData) => {
        try {
            // Merge new data with existing user data
            const updatedUser = { ...user, ...newData };
            setUser(updatedUser);
            // Persist to storage
            await authService.saveUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    };

    const value = {
        user,
        role: user?.role || null,
        loading,
        isLoading: loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser: updateUserProfile,
        setUserData,
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
