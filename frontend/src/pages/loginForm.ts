import { LoginRequest, loginUser } from '../services/api.js';
import { loadGameRoom } from './gameRoom.js'; // Correct path to gameRoom.ts

export function loadLoginForm(): void
{
	const app = document.getElementById('root')!;
	fetch('/templates/login.html')
	.then(response => 
	{
		if (!response.ok)
		{
			throw new Error(`Fetch failed: ${response.status}`);
		}
		return response.text();
	})
	.then(html => 
	{
		app.innerHTML = html;
		
		document.getElementById('login-form')!.addEventListener('submit', async (event) => 
		{
			event.preventDefault();

			const name = (document.getElementById('username') as HTMLInputElement).value;
			const password = (document.getElementById('password') as HTMLInputElement).value;

			const user: LoginRequest = {
				name,
				password
			};
			const success = await loginUser(user);

			if (success)
			{
				// loadGameRoom();
			}
		});
	})
	.catch(error => 
	{
		console.error('Error loading login page:', error);
		alert('Something went wrong. Please try again later.'); //make error handling unified
	});
}
