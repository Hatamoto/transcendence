import { registerUser } from "../utils/api.js";

export function loadRegistrationForm(): void {
	const app = document.getElementById('app')!;

	fetch('/templates/register.html')
		.then(response => {
			if (!response.ok) {
				throw new Error(`Fetch failed: ${response.status}`);
			}
			return response.text();
		})
		.then(html => {
			app.innerHTML = html;

			const passwordError = document.getElementById('password-error') as HTMLElement;
			
			document.getElementById('register-form')!.addEventListener('submit', async (e) => {
				e.preventDefault();

				const username = (document.getElementById('username') as HTMLInputElement).value;
				const email = (document.getElementById('email') as HTMLInputElement).value;
				const password = (document.getElementById('password') as HTMLInputElement).value;
				const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;

				if (password !== confirmPassword) {
					passwordError.style.display = 'block';
					return;
				}

				passwordError.style.display = 'none';
				const success = await registerUser(username, email, password); //bad request

				if (success) {
					alert('WORKED'); //temp
				}
			});
		})
		.catch(error => {
			console.error('Error loading register page:', error);
			alert('Something went wrong. Please try again later.');
		});
}

  