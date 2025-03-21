import { loginUser } from '../utils/api.js';
import { loadGameRoom } from './gameRoom.js'; // Correct path to gameRoom.ts

export function loadLoginForm(): void {
	const app = document.getElementById('app')!;
	app.innerHTML = `
        <div id="login-page" class="bg-white p-6 rounded-lg shadow-md w-96">
            <h1 class="text-2xl font-bold text-center mb-4">Login</h1>
            <form id="login-form" class="space-y-4">
                <label for="username" class="block text-sm font-medium">Username:</label>
                <input
                    type="text"
                    id="username"
                    class="w-full border border-gray-300 rounded-md p-2"
                    required
                />

                <label for="password" class="block text-sm font-medium">Password:</label>
                <input
                    type="password"
                    id="password"
                    class="w-full border border-gray-300 rounded-md p-2"
                    required
                />

                <button
                    type="submit"
                    class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                >
                    Login
                </button>
            </form>
        </div>
    `;

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
