import api from './api';


export const routes = {
    'banners': () => api.get('/banners'),
    'filtros': () => api.get('/filtros'),
    'municipios': (params={}) => api.get('/municipios',{ params: params}),
    'destinos-procurados': (params={}) => api.get('/destinos-procurados',{ params: params}),

    'trechos-viagem': (params={}) => api.get('/trechos-viagem',{ params: params}),
    'rooms.poltronas': (params={}) => api.get('/comodos/poltronas',{ params: params}),
    'rooms.camarotes': (params={}) => api.get('/comodos/camarotes',{ params: params}),
    'rooms.free': (params={}) => api.get('/comodos/livres-por-tipo',{ params: params}),
    'rooms.init-vendas': (params= {}) => api.post('/reservas/comecar-venda',params),
    'rooms.reservas': (params= {}) => api.post('/reservas/comodo',params),
    'rooms.reservas.delete': (params= {}) => api.delete('/reservas/comodo',params),
    'ticket.print': (ticket_id) => api.get(`/passagens/imprimir/${ticket_id}/pdf`),

    'order.my': (params= {}) => api.get('/pedidos'),
    'order.open': (params= {}) => api.get('/pedidos/ultimo-aberto/dados'),
    'order': (params= {}) => api.post('/pedidos',params),
    'order.delete': (order_id,params= {}) => api.delete(`/pedidos/${order_id}/remover-comodo`,{data:params}),
    'order.confirm': (order_id,params= {}) => api.post(`/pedidos/${order_id}/gerar-passagens`,params),
    'payment.pix': (params= {}) => api.post('/pagamentos/pix',params),
    'payment.credito': (params= {}) => api.post('/pagamentos/credito',params),
    'payment.status': (order_id) => api.get(`/pedidos/${order_id}/status`),

    'user.me':() => api.get('/me'),
    'user.login':(params= {}) => api.post('/login',params),
    'user.logout':(params= {}) => api.delete('/logout',params),
    'user.register':(params= {}) => api.post('/register',params),


}

