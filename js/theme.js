const defaultDarkMode = true;

export function getStoredDarkMode() {
    try {
        const storedDarkMode = localStorage.getItem("dark");
        return storedDarkMode === null
            ? defaultDarkMode
            : Boolean(JSON.parse(storedDarkMode));
    } catch {
        return defaultDarkMode;
    }
}

export function setStoredDarkMode(dark) {
    try {
        localStorage.setItem("dark", JSON.stringify(Boolean(dark)));
    } catch {
        // Keep the visual toggle usable even if localStorage is unavailable.
    }
}
