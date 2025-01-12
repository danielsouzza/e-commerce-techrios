import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
    { path: '/', component: ()=>import('../pages/home.vue'), name: 'home'},
    { path: '/comprar-passagem', component: ()=>import('../pages/Sale.vue'), name:'sale' },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router