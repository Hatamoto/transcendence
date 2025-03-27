import { loadFrontPage } from "../pages/frontpage.js";
import { loadLoginForm } from "../pages/loginForm.js";
import { loadRegistrationForm } from "../pages/registrationForm.js";
import { loadGameRoom } from "../pages/gameRoom.js";

class MultiKeyMap<V extends Function> {
	private map: Map<string, V> = new Map();
	
	set(keys: string[], value: V) {
		keys.forEach(key => {
		this.map.set(key, value);
		});
	}
	
	get(key: string): V | undefined {
	  return this.map.get(key);
	}
}
  
const routes = new MultiKeyMap();

routes.set(['/', 'Home'], loadFrontPage);
routes.set(['/login', 'Login'], loadLoginForm);
routes.set(['/register', 'Register'], loadRegistrationForm);
routes.set(['/game', 'Game'], loadGameRoom);

export function route(event: Event, path: string): void {
    event.preventDefault();
    window.history.pushState({}, '', path);
    loadPage(path);
} //maybe not best idea, fix init then


function loadPage(path: string): void {
    const app = document.getElementById('root');
    if (!app) {
        console.error('Element with id "root" not found');
        return;
    }

    console.log(path);
	console.log(routes.get(path));
	const routeHandler = routes.get(path);
    if (routeHandler) {
        routeHandler();
    } else {
		fetch('/templates/404.html')
			.then(response => {
				if (!response.ok) {
					throw new Error(`Fetch failed: ${response.status}`);
				}
				return response.text();
			})
			.then(html => {
				console.log(html);
				app.innerHTML = html;
			})
		.catch(error => {
			console.error('Error loading page:', error);
			app.innerHTML = '<h1>404 - Page Not Found</h1>';
		});
	}
}
