import { store } from './main.js';
import { SITE_VERSION } from './site-meta.js';
import routes from './routes.js';

const app = Vue.createApp({
    data: () => ({
        siteVersion: SITE_VERSION,
        store,
    }),
});

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

app.use(router);

app.mount('#app');