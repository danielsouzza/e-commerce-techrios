import { createRouter, createWebHistory } from 'vue-router'
import { useCartStore } from "../store/CartStore.js";
import { userAuthStore } from "../store/AuthStore.js";

const appName = import.meta.env.VITE_APP_NAME || 'Yjara Viagens';

const routes = [
    {
        path: '/',
        component: () => import('../pages/Home.vue'),
        name: 'home',
        meta: { title: 'Home' }
    },
    {
        path: '/rios-de-ofertas',
        component: () => import('../pages/RiosDeOfertas.vue'),
        name: 'rios-de-ofertas',
        meta: { title: 'Rios de Ofertas' }
    },
    {
        path: '/viagens-em-destaque',
        component: () => import('../pages/Destaques.vue'),
        name: 'viagens-em-destaque',
        meta: { title: 'Viagens em Destaque' }
    },
    {
        path: '/institucional',
        component: () => import('../pages/Institucional.vue'),
        name: 'institucional',
        meta: { title: 'Institucional' }
    },
    {
        path: '/viagens-imbativeis',
        component: () => import('../pages/PrecosEmbativeis.vue'),
        name: 'viagens-imbativeis',
        meta: { title: 'Viagens Imbatíveis' }
    },
    {
        path: '/login',
        component: () => import('../pages/Login.vue'),
        name: 'login',
        meta: { title: 'Login' }
    },
    {
        path: '/registrar',
        component: () => import('../pages/Register.vue'),
        name: 'register',
        meta: { title: 'Registrar' }
    },
    {
        path: '/comprar-passagem/:tab',
        component: () => import('../pages/Sale.vue'),
        name: 'sale',
        props: true,
        meta: { title: 'Comprar Passagem' }
    },
    {
        path: '/area-do-cliente/:tab',
        component: () => import('../pages/AreaDoCliente.vue'),
        name: 'area-do-cliente',
        meta: { title: 'Área do Cliente', requiresAuth: true },
        props: true,
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import('../pages/NotFound.vue'),
        name: 'not-found',
        meta: { title: 'Página Não Encontrada' }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0, behavior: 'smooth' };
    }
})

router.afterEach((to) => {
    document.title = to.meta.title + " - " + appName;
});

router.beforeEach(async (to, from, next) => {
    const cartStore = useCartStore();
    const userStore = userAuthStore();
    await cartStore.loadCart();

    if (to.meta.requiresAuth && !userStore.isAuthenticated()) {
        return next({ name: 'login' });
    }

    if (to.name === 'sale' && to.params.tab === 'pagamento') {
        if (cartStore.isEmptyCart()) {
            return next({ name: 'home' });
        }
    }

    next();
});

export default router;
