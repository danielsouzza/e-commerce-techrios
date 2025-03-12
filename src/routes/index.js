import { createRouter, createWebHistory } from 'vue-router'
import { useCartStore } from "../store/CartStore.js";
import { userAuthStore } from "../store/AuthStore.js";
import {useLoadingStore} from "../store/states.js";

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
        path: '/quem-somos',
        component: () => import('../pages/QuemSomos.vue'),
        name: 'quem-somos',
        meta: { title: 'Quem somos' }
    },
    {
        path: '/politica-de-privacidade',
        component: () => import('../pages/PoliitcasPrivaciadedades.vue'),
        name: 'politica-de-privacidade',
        meta: { title: 'Políticas de Privacidades' }
    },
    {
        path: '/vantagens',
        component: () => import('../pages/Vantagens.vue'),
        name: 'vantagens',
        meta: { title: 'Vantagens' }
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
        path: '/validar-email',
        component: () => import('../pages/ValidarEmail.vue'),
        name: 'validar-email',
        meta: { title: 'Validação de email' }
    },
    {
        path: '/esqueci_minha_senha',
        component: () => import('../pages/Login.vue'),
        props: {tab:'reset-password'},
        name: 'esqueci_minha_senha',
        meta: { title: 'Esqueci minha senha' }
    },
    {
        path: '/restaurar-senha',
        component: () => import('../pages/ResetPassword.vue'),
        name: 'reset-password',
        meta: { title: 'Redefinir senha' }
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
    const loadingStore = useLoadingStore();
    setTimeout(() => {
        loadingStore.stopLoading(); // Desativa o loading com um pequeno delay
    }, 300);
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

    const loadingStore = useLoadingStore();
    loadingStore.startLoading();

    next();
});

export default router;
