import axios from 'axios';


export function getApiBaseUrl() {
    return import.meta.env.VITE_API_TECHRIOS_URL;
}

export function getAppBaseUrl() {
    return window.location.origin;
}


export const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 20000,
})

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem('auth_token');
        config.params = config.params || {};
        config.params.subdomain = window.subdomain
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
