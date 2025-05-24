import { createRouter, createWebHistory } from 'vue-router'
import { useCartStore } from "../store/CartStore.js";
import { userAuthStore } from "../store/AuthStore.js";
import {useLoadingStore} from "../store/states.js";
import {scrollBehavior} from "../event-bus.js";
import {api} from "../services/api.js";

const routes = [
    {
        path: '/',
        component: () => import('../pages/Home.vue'),
        name: 'home',
        meta: { title: 'Home' }
    },
    {
        path: '/super-ofertas',
        component: () => import('../pages/RiosDeOfertas.vue'),
        name: 'super-ofertas',
        meta: { title: 'Super Ofertas' }
    },
    {
        path: '/viagens-em-destaque',
        component: () => import('../pages/Destaques.vue'),
        name: 'viagens-em-destaque',
        meta: { title: 'Viagens em Destaque' }
    },
    {
        path: '/destinos-mais-procurados',
        component: () => import('../pages/MaisBuscados.vue'),
        name: 'destinos-mais-procurados',
        meta: { title: 'Destinos Mais procurados' }
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
        path: '/esqueci-minha-senha',
        component: () => import('../pages/ForgotPassword.vue'),
        name: 'esqueci-minha-senha',
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
        path: '/onde-estamos',
        component: () => import('../pages/OndeEstamos.vue'),
        name: 'onde-estamos',
        meta: { title: 'Onde estamos' }
    },
    {
        path: '/escolher-passagem/:origem/:destino/:type/:dataIda/:dataVolta?',
        name: 'escolher-passagem',
        meta: { title: 'Escolher Passagem'},
        component: () => import('../pages/Sale/ChooseTrip.vue'),
    },
    {
        path: '/informa-dados',
        name: 'informa-dados',
        meta: { title: 'Informar Dados'},
        component: () => import('../pages/Sale/InsertData.vue'),
    },
    {
        path: '/pagamento',
        name: 'pagamento',
        meta: { title: 'Pagamento'},
        component: () => import('../pages/Sale/PaymentMethods.vue'),
    },
    {
        path: '/compra-realizada/pix',
        name: 'compra-realizada-pix',
        meta: { title: 'Compra Realizada'},
        component: () => import('../pages/Sale/PurchaseMade.vue'),
    },
    {
        path: '/compra-realizada/credito',
        name: 'compra-realizada-credito',
        meta: { title: 'Compra Realizada'},
        component: () => import('../pages/Sale/PurchaseMade.vue'),
    },
    {
        path: '/area-do-cliente/:tab',
        component: () => import('../pages/AreaDoCliente.vue'),
        name: 'area-do-cliente',
        meta: { title: 'Área do Cliente', requiresAuth: true },
        props: true,
    },
    {
        path: '/pagamento/:id',
        component: () => import('../pages/PaymentPage.vue'),
        name: 'payment',
        props: true,
        meta: { title: 'Pagamento' }
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
    scrollBehavior(to, from, savedPosition) {return { top: 0 }},
    routes
})

router.afterEach((to, from) => {
    const title = window.appname || import.meta.env.VITE_APP_NAME || 'Yjara Viagens'
    document.title = to.meta.title + " - " + title;
    const loadingStore = useLoadingStore();

    setTimeout(() => {
        loadingStore.stopLoading();
        if (!to.hash) {
            scrollBehavior();
        }
    }, 300);
});


router.beforeEach((to, from, next) => {


    if (to.meta.requiresAuth && !localStorage.getItem('auth_token')) {
        next({ name: 'login' });
    }

    if (to.name === 'pagamento' && useCartStore().isEmptyCart()) {
        next({ name: 'home' });
    }

    if(to.name === 'informa-dados' && !sessionStorage.getItem('form-sale')){
        next({ name: 'home' });
    }

    if(to.name === 'compra-realizada' && !sessionStorage.getItem('oder-confirm-payment')){
        next({ name: 'home' });
    }
    next();
});


export default router;
