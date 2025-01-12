import api from './api';


export const routes = {
    'trechos-viagem': (params={}) => api.get('/trechos-viagem',{ params: params}),
    'rooms.poltronas': (params={}) => api.get('/comodos/poltronas',{ params: params}),
    'filtros': () => api.get('/filtros'),
    'banners': () => api.get('/banners'),
}

