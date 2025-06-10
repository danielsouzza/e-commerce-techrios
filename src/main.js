import {createApp, reactive} from 'vue'

import 'vuetify/styles'
import './assets/style.css';
import App from './App.vue'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import VueTheMask from 'vue-the-mask'
import {createPinia} from 'pinia'
import '@mdi/font/css/materialdesignicons.css';
import {pt} from 'vuetify/locale'

import router from './routes'
import {DEFAULT_THEME} from "./themes/DefaultTheme.js";
import {routes} from "./services/fetch.js";
import {getApiBaseUrl} from "./services/api.js";

// Otimização de carregamento de fontes
const style = document.createElement('style')
style.textContent = `
  @font-face {
    font-family: 'Material Design Icons';
    font-display: swap;
  }
`
document.head.appendChild(style)

// Carregamento assíncrono de fontes MDI
const mdiStyles = document.createElement('link')
mdiStyles.rel = 'stylesheet'
mdiStyles.href = '@mdi/font/css/materialdesignicons.css'
mdiStyles.media = 'print'
mdiStyles.onload = function() { this.media = 'all' }
document.head.appendChild(mdiStyles)

const hostname = window.location.hostname; // ex: "agencia.exemplo.com" ou "empresa.com.br"
const parts = hostname.split('.');

// Regra para produção
if (import.meta.env.VITE_APP_ENV === 'producao') {
    // Se for subdomínio (ex: agencia.exemplo.com)
    if (parts.length > 2) {
        window.subdomain = parts[0]; // pega só o subdomínio
    } else {
        window.subdomain = hostname; // pega o domínio inteiro
    }
} else {
    // Ambiente local ou dev
    if (parts.length > 2 && parts[0] !== 'loja') {
        window.subdomain = parts[0];
    } else {
        window.subdomain = hostname;
    }
}


const themeConfig = reactive({
    primaryColor: '#00579d',
    secondaryColor: '#3dccfd',
    logo: '/assets/images/logo-yjara.svg',
});

window.dataLayer = window.dataLayer || [];

async function fetchTheme() {
    if (window.subdomain) {
        try {
            const response = await  routes['empresa.theme']()
            const baseurl = getApiBaseUrl()?.replaceAll('api','')
            const { theme, image_path , custom_name, empresa_id, agencia_id} = response.data.data;


            themeConfig.primaryColor = theme.primary_color || themeConfig.primaryColor;
            themeConfig.secondaryColor = theme.secondary_color || themeConfig.secondaryColor;
            themeConfig.logo = baseurl + image_path
            window.appname = custom_name
            window.empresa_id = empresa_id
            window.agencia_id = agencia_id


        } catch (error) {
            console.error("Erro ao buscar tema da loja:", error);
        }
    }
    // Aplicar cores do tema de forma otimizada
    requestAnimationFrame(() => {
        document.title = window.appname || import.meta.env.VITE_APP_NAME || 'Yjara Viagens';
        document.documentElement.style.setProperty('--color-primary', themeConfig.primaryColor);
        document.documentElement.style.setProperty('--color-secondary', themeConfig.secondaryColor);
    });
}

(async () => {
    await fetchTheme();

    const customTheme = {
        ...DEFAULT_THEME,
        name: 'customTheme',
        colors: {
            ...DEFAULT_THEME.colors,
            primary: themeConfig.primaryColor,
            secondary: themeConfig.secondaryColor,
        }
    };

    const vuetify = createVuetify({
        ssr: true,
        locale: {
            locale: 'pt',
            messages:{pt}
        },
        components,
        directives,
        theme: {
            defaultTheme: 'customTheme',
            themes: {
                customTheme
            },
        },
    });

    const app = createApp(App);
    app.use(createPinia());

    app.use(VueTheMask);
    app.use(router);
    app.use(vuetify);
    app.provide('themeConfig', themeConfig);

    // Pré-carregamento de rotas críticas
    router.beforeResolve((to, from, next) => {
        if (to.matched.some(record => record.meta.critical)) {
            import(`./pages/${to.name}.vue`)
        }
        next()
    });

    app.mount('#app');
})();
