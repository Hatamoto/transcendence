import { loadLoginForm } from '../pages/loginForm.js';
import { loadRegistrationForm } from '../pages/registrationForm.js';
import { loadGameRoom } from '../pages/gameRoom.js';
import { route } from '../init.js'; 

export function loadFrontPage(): void {
    const app = document.getElementById('root')!;

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
        <button
            id="game-debug"
            type="button"
            class="w-64 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
            Debug Game
        </button>
        </div>
    `; // Temp HTML

    app.innerHTML = frontPageHtml;

    // Ensure event listeners are correctly added
    document.getElementById('login-button')!.addEventListener('click', (event) => {
        event.preventDefault(); // Optionally prevent default if needed
        route(event, '/login');
    });

    document.getElementById('register-button')!.addEventListener('click', (event) => {
        event.preventDefault(); // Optionally prevent default if needed
        route(event, '/register');
    });

    // Uncomment if you want to enable the game debug button
    // document.getElementById('game-debug')!.addEventListener('click', (event) => {
    //     route(event, '/debug');
    // });
}
