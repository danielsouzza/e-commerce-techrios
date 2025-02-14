import axios from 'axios';


function getApiBaseUrl() {
    return import.meta.env.VITE_API_TECHRIOS_URL;
}


const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
