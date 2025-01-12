import axios from 'axios';

function getSubdomain() {
    const host = window.location.hostname;
    if (import.meta.env.MODE === 'development') {
        return import.meta.env.VITE_API_SUBDOMAIN_DEFAULT || null;
    }
    const parts = host.split('.');
    if (parts.length > 2) {
        return parts[0];
    }
    return null;
}


function getApiBaseUrl() {
    const subdomain = getSubdomain();
    if (subdomain) {
        return import.meta.env.VITE_API_SUBDOMAIN_URL.replace('{subdomain}', subdomain);
    }
    return import.meta.env.VITE_API_TECHRIOS_URL;
}


const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 5000,
});

export default api;
