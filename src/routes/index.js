import {createRouter, createWebHistory} from 'vue-router'
import {useCartStore} from "../store/CartStore.js";
import {userAuthStore} from "../store/AuthStore.js";

const routes = [
    {
        path: '/',
        component: ()=>import('../pages/Home.vue'), name: 'home'},
    {
        path: '/rios-de-ofertas',
        component: ()=>import('../pages/RiosDeOfertas.vue'), name: 'rios-de-ofertas'},
    {
        path: '/viagems-em-destaques',
        component: ()=>import('../pages/Destaques.vue'), name: 'viagems-em-destaques'},
    {
        path: '/viagems-imbativeis',
        component: ()=>import('../pages/PrecosEmbativeis.vue'), name: 'viagems-imbativeis'},
    {
        path: '/login',
        component: ()=>import('../pages/Login.vue'), name: 'login'},
    {
        path: '/registrar',
        component: ()=>import('../pages/Register.vue'), name: 'register'},
    {
        path: '/comprar-passagem/:tab',
        component: ()=>import('../pages/Sale.vue'), name:'sale',props:true },
    {
        path: '/area-do-cliente/:tab',
        component: ()=>import('../pages/AreaDoCliente.vue'),
        name:'area-do-cliente',
        meta: { requiresAuth: true },
        props:true,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {

        return { top: 0, behavior: 'smooth' };
    }
})

router.beforeEach(async (to, from, next) => {
    const cartStore = useCartStore()
    const userStore = userAuthStore()
    await cartStore.loadCart()

    if (to.meta.requiresAuth && !userStore.isAuthenticated()) {
        return next({name: 'login'})
    }

    if (to.name === 'sale' && to.params.tab === 'pagamento') {

        if (cartStore.isEmptyCart()) {
            return next({name: 'home'});
        }
    }
    next()
})

export default router