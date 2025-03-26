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
    loadPageContent(window.location.pathname || '/');
});


export function route(event: Event, path: string): void {
    event.preventDefault();
    window.history.pushState({}, '', path);
    loadPageContent(path);
}


function loadPageContent(path: string): void {
    const main = document.getElementById('root');

    // Ensure the element exists
    if (!main) {
        console.error('Element with id "root" not found');
        return;
    }

    // Simulate loading content based on the path
    switch (path) {
        case '/':
            import('./pages/frontpage.js').then(module => {
                module.loadFrontPage();
            });
			break;
        case '/login':
            import('./pages/loginForm.js').then(module => {
                module.loadLoginForm();
            });
            break;
        case '/register':
            import('./pages/registrationForm.js').then(module => {
                module.loadRegistrationForm();
            });
			break;
        default:
            main.innerHTML = '<h1>404 - Page Not Found</h1>';
    }
} //change routes to map, this is retarded

window.addEventListener('popstate', () => {
    loadPageContent(window.location.pathname);
});
