import routes from './routes.js';

function getStoredDarkMode() {
    try {
        return JSON.parse(localStorage.getItem('dark')) || false;
    } catch {
        return false;
    }
}

export const store = Vue.reactive({
    dark: getStoredDarkMode(),
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
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
