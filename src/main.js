import { createApp } from 'vue'

import 'vuetify/styles'
import './assets/style.css';
import App from './App.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css';

import router from './routes'
import {DEFAULT_THEME} from "./themes/DefaultTheme.js";

const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
        defaultTheme: 'DEFAULT_THEME',
        themes: {
            DEFAULT_THEME,
        }
    },
})

createApp(App).use(router).use(vuetify).mount('#app')
