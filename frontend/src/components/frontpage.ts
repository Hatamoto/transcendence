import { loadLoginForm } from '../components/loginForm.js';
import { loadRegistrationForm } from '../components/registrationForm.js';

export function loadFrontPage(): void {
	const app = document.getElementById('app')!;

	const frontPageHtml = `
		<div class="flex flex-col items-center justify-center space-y-4 h-screen w-full">
		<button
			id="login-button"
			type="button"
			class="w-64 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
		>
			Login
		</button>
		<button
			id="register-button"
			type="button"
			class="w-64 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
		>
			Register
		</button>
		</div>
	`; //temp html

	app.innerHTML = frontPageHtml;

	document.getElementById('login-button')!.addEventListener('click', () => {
		loadLoginForm();
	});

	document.getElementById('register-button')!.addEventListener('click', () => {
		loadRegistrationForm();
	});
}
