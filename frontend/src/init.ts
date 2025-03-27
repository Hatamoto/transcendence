import { route } from "./router/router.js";

window.addEventListener('DOMContentLoaded', () => {
    console.log("✅ index.ts loaded successfully!");

    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

	
	/*
    if (cookies.accessToken) {
		loadGameRoom(); 
    }
	*/
	route(new Event('DOMContentLoaded'), window.location.pathname || '/');
});

window.addEventListener('popstate', () => {
    route(new Event('popstate'), window.location.pathname);
});
