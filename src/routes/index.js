import {createRouter, createWebHistory} from 'vue-router'

const routes = [
    { path: '/', component: ()=>import('../pages/Home.vue'), name: 'home'},
    { path: '/login', component: ()=>import('../pages/Login.vue'), name: 'login'},
    { path: '/registrar', component: ()=>import('../pages/Register.vue'), name: 'register'},
    { path: '/comprar-passagem', component: ()=>import('../pages/Sale.vue'), name:'sale' },
    { path: '/area-do-cliente/:tab', component: ()=>import('../pages/AreaDoCliente.vue'), name:'area-do-cliente',props:true},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // Sempre rola para o topo ao mudar de página
        return { top: 0, behavior: 'smooth' };
    }
})

export default router