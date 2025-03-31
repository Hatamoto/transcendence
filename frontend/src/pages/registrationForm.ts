import { UserRequest, registerUser } from "../services/api.js";

export function loadRegistrationForm(): void {
	const app = document.getElementById('root')!;

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

				const name = (document.getElementById('username') as HTMLInputElement).value;
				const email = (document.getElementById('email') as HTMLInputElement).value;
				const password = (document.getElementById('password') as HTMLInputElement).value;
				const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;

				if (password !== confirmPassword) {
					passwordError.style.display = 'block';
					return;
				}

				passwordError.style.display = 'none';
				const user: UserRequest = {
					name,
					email,
					password
				};
				const success = await registerUser(user); //needs to check return status now

				if (success) {
					alert('WORKED'); //temp
				}
			});
		})
		.catch(error => {
			console.error('Error loading register page:', error);
			alert('Something went wrong. Please try again later.'); //make error handling unified
		});
}

  