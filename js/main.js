import routes from './routes.js';
import { getStoredDarkMode, setStoredDarkMode } from './theme.js';

export const store = Vue.reactive({
    dark: getStoredDarkMode(),
    toggleDark() {
        this.dark = !this.dark;
        setStoredDarkMode(this.dark);
    },
});

const app = Vue.createApp({
    data: () => ({ store }),
});
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

app.use(router);

app.mount('#app');
