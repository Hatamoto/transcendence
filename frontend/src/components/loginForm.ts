import { loginUser } from '../utils/api.js';
import { loadGameRoom } from './gameRoom.js'; // Correct path to gameRoom.ts

export function loadLoginForm(): void {
	const app = document.getElementById('app')!;
	fetch('/templates/login.html')
		.then(Response => Response.text())
		.then(html => {
			app.innerHTML = html;
		}) //maybe check if fetch fails idk

	document.getElementById('login-form')!.addEventListener('submit', async (e) => {
		e.preventDefault();

		const username = (document.getElementById('username') as HTMLInputElement).value;
		const password = (document.getElementById('password') as HTMLInputElement).value;

		const success = await loginUser(username, password);

		if (success) {
			loadGameRoom();
		}
	});
}
