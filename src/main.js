import {createApp, reactive} from 'vue'

import 'vuetify/styles'
import './assets/style.css';
import App from './App.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import VueTheMask from 'vue-the-mask'
import { createPinia } from 'pinia'
import '@mdi/font/css/materialdesignicons.css';
import { pt } from 'vuetify/locale'

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

const hostname = window.location.hostname;
const parts = hostname.split(".");
const subdomain = parts.length > 1 && parts[0] !== "loja" ? parts[0] : null;

window.subdomain = subdomain;

const themeConfig = reactive({
    primaryColor: '#00579d',
    secondaryColor: '#3dccfd',
    logo: '/assets/images/logo-yjara.svg'
});

async function fetchTheme() {
    if (subdomain) {
        try {
            const response = await  routes['empresa.theme']({subdomain:window.subdomain})
            const baseurl = getApiBaseUrl()?.replaceAll('api','')
            const { theme, image_path } = response.data.data;


            themeConfig.primaryColor = theme.primary_color || themeConfig.primaryColor;
            themeConfig.secondaryColor = theme.secondary_color || themeConfig.secondaryColor;
            themeConfig.logo = baseurl + image_path

        } catch (error) {
            console.error("Erro ao buscar tema da loja:", error);
        }
    }
    // Aplicar cores do tema de forma otimizada
    requestAnimationFrame(() => {
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

    // Configuração do Pinia com estado persistente
    const pinia = createPinia();
    app.use(pinia);
    
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
