import {createRouter, createWebHistory} from 'vue-router'

const routes = [
    { path: '/', component: ()=>import('../pages/Home.vue'), name: 'home'},
    { path: '/login', component: ()=>import('../pages/Login.vue'), name: 'login'},
    { path: '/registrar', component: ()=>import('../pages/Register.vue'), name: 'register'},
    { path: '/comprar-passagem', component: ()=>import('../pages/Sale.vue'), name:'sale' },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router