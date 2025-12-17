import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
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
            const authToken = await authService.getToken();
            if (authToken) {
                const userData = await authService.getUser();
                if (userData) {
                    setUser(userData);
                    setToken(authToken);
                    setIsAuthenticated(true);
                } else {
                    // Si no hay datos de usuario, limpiar todo
                    setUser(null);
                    setToken(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setToken(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            setUser(response.user);
            setToken(response.token);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await authService.register(name, email, password);
            setUser(response.user);
            setToken(response.token);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            setUser(null);
            setToken(null);
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
            setToken(null);
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
        token,
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
