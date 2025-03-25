import { loginUser } from '../utils/api.js';
import { loadGameRoom } from './gameRoom.js'; // Correct path to gameRoom.ts

export function loadLoginForm(): void {
	const app = document.getElementById('app')!;
	fetch('/templates/login.html')
		.then(response => {
			if (!response.ok) {
				throw new Error(`Fetch failed: ${response.status}`);
			}
			return response.text();
		})
		.then(html => {
			app.innerHTML = html;
			document.getElementById('login-form')!.addEventListener('submit', async (e) => {
				e.preventDefault();

				const username = (document.getElementById('username') as HTMLInputElement).value;
				const password = (document.getElementById('password') as HTMLInputElement).value;

				const success = await loginUser(username, password);

				if (success) {
					loadGameRoom();
				}
			});
		})
		.catch(error => {
			console.error('Error loading login page:', error);
			alert('Something went wrong. Please try again later.');
		});
}
