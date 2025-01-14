import api from './api';


export const routes = {
    'trechos-viagem': (params={}) => api.get('/trechos-viagem',{ params: params}),
    'rooms.poltronas': (params={}) => api.get('/comodos/poltronas',{ params: params}),
    'rooms.camarotes': (params={}) => api.get('/comodos/camarotes',{ params: params}),
    'rooms.free': (params={}) => api.get('/comodos/livres-por-tipo',{ params: params}),
    'filtros': () => api.get('/filtros'),
    'banners': () => api.get('/banners'),
}

