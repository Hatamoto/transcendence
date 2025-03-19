import { startNewGame } from '../game/game.js';

export function loadGameRoom(): void {
	const app = document.getElementById('app')!;
	app.innerHTML = `
        <div id="gameroom-page" class="bg-green-100 p-8 rounded-lg shadow-md w-96">
            <h1 class="text-2xl font-bold text-center mb-4">Welcome to the Gameroom!</h1>
            <p class="text-center text-gray-600 mb-4">You are now logged in.</p>

			<!-- Start New Game Button -->
			<button id="test-btn" 
					class="block w-full bg-green-500 text-white text-center py-2 rounded-md hover:bg-green-600">
				Start New Game
			</button>

            <!-- Logout Button -->
            <button 
                id="logout-btn"
                class="mt-4 block w-full bg-red-500 text-white text-center py-2 rounded-md hover:bg-red-600"
            >
                Logout
            </button>
        </div>
    `;

	// Start New Game Button Logic
	const startGameBtn = document.getElementById('test-btn');
	startGameBtn?.addEventListener('click', () => {
		// Call your function to start a new game.
		// Replace this with your actual game startup logic.
		console.log("Starting new game...");
		startNewGame();
	});

    // Logout Button Logic
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'GET',
                credentials: 'include' // Ensures cookies are included
            });

            if (response.ok) {
                // Clear cookies and reload login form
                document.cookie = `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
                alert("You have been logged out.");
                window.location.reload(); // Reload the page to show the login screen
            } else {
                const data = await response.json();
                alert(`Logout failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Logout Error:", error);
            alert("Network error during logout.");
        }
    });
}
