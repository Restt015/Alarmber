import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

const authService = {
    /**
     * Iniciar sesión
     */
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            // Guardar token y datos del usuario
            if (response.success && response.data) {
                await this.saveToken(response.data.token);
                await this.saveUser(response.data.user);
                return response.data;
            }

            throw new Error(response.message || 'Error al iniciar sesión');
        } catch (error) {
            throw error;
        }
    },

    /**
     * Registrar nuevo usuario
     */
    async register(name, email, password, phone = '') {
        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                phone
            });

            // Guardar token y datos del usuario
            if (response.success && response.data) {
                await this.saveToken(response.data.token);
                await this.saveUser(response.data.user);
                return response.data;
            }

            throw new Error(response.message || 'Error al registrarse');
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtener perfil del usuario autenticado
     */
    async getProfile() {
        try {
            const response = await api.get('/auth/profile');

            if (response.success && response.data) {
                await this.saveUser(response.data);
                return response.data;
            }

            throw new Error('Error al obtener perfil');
        } catch (error) {
            throw error;
        }
    },

    /**
     * Actualizar perfil
     */
    async updateProfile(data) {
        try {
            const response = await api.put('/auth/profile', data);

            if (response.success && response.data) {
                await this.saveUser(response.data);
                return response.data;
            }

            throw new Error('Error al actualizar perfil');
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cambiar contraseña
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.put('/auth/password', {
                currentPassword,
                newPassword
            });

            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cerrar sesión
     */
    async logout() {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
            return true;
        } catch (error) {
            console.error('Error logging out:', error);
            return false;
        }
    },

    /**
     * Guardar token en AsyncStorage
     */
    async saveToken(token) {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error saving token:', error);
            throw error;
        }
    },

    /**
     * Obtener token guardado
     */
    async getToken() {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    /**
     * Guardar datos del usuario
     */
    async saveUser(userData) {
        try {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving user data:', error);
            throw error;
        }
    },

    /**
     * Obtener datos del usuario guardados
     */
    async getUser() {
        try {
            const userData = await AsyncStorage.getItem(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    /**
     * Verificar si el usuario está autenticado
     */
    async isAuthenticated() {
        const token = await this.getToken();
        return !!token;
    }
};

export default authService;
