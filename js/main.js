import routes from './routes.js';

function getStoredDarkMode() {
    try {
        const storedDarkMode = localStorage.getItem('dark');
        return storedDarkMode === null ? true : JSON.parse(storedDarkMode);
    } catch {
        return true;
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
