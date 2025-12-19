import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL del backend - ajusta según tu configuración
// Base URL del backend - ajusta según tu configuración
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 segundos
    // IMPORTANTE: No set default Content-Type - dejarlo undefined para FormData
    transformRequest: [(data, headers) => {
        // Si es FormData, NO hacer nada - dejar que axios lo maneje
        if (data instanceof FormData) {
            // NO setear Content-Type - axios lo hará automáticamente con boundary
            delete headers['Content-Type'];
            return data;
        }
        // Para requests normales (JSON), setear Content-Type
        headers['Content-Type'] = 'application/json';
        return JSON.stringify(data);
    }],
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            // El servidor respondió con un código de error
            const message = error.response.data?.message || 'Error del servidor';
            return Promise.reject(new Error(message));
        } else if (error.request) {
            // La petición fue hecha pero no hubo respuesta
            return Promise.reject(new Error('No hay conexión con el servidor'));
        } else {
            // Error al configurar la petición
            return Promise.reject(new Error('Error al procesar la solicitud'));
        }
    }
);

export default api;
