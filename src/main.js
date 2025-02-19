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

import router from './routes'
import {DEFAULT_THEME} from "./themes/DefaultTheme.js";
import {routes} from "./services/fetch.js";
import {getApiBaseUrl} from "./services/api.js";

const hostname = window.location.hostname;
const parts = hostname.split(".");
const subdomain = parts.length > 1 ?  parts[0] : null;

window.subdomain = subdomain != "loja" ? subdomain : null;

const themeConfig = reactive({
    primaryColor: '#00579d',
    secondaryColor: '#3dccfd',
    logo: '/src/assets/images/logo-yjara.svg'
});

async function fetchTheme() {
    if (subdomain) {
        try {
            const response = await  routes['empresa.theme']({subdomain:window.subdomain})
            const baseurl = getApiBaseUrl().replaceAll('api','')
            const { theme, image_path } = response.data.data;


            themeConfig.primaryColor = theme.primary_color || themeConfig.primaryColor;
            themeConfig.secondaryColor = theme.secondary_color || themeConfig.secondaryColor;
            themeConfig.logo = baseurl + image_path

        } catch (error) {
            console.error("Erro ao buscar tema da loja:", error);
        }
    }
    document.documentElement.style.setProperty('--color-primary', themeConfig.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', themeConfig.secondaryColor);
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

    app.mount('#app');
})();
