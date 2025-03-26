import { startNewGame } from '../game/game.js';

export function loadGameRoom(): void {
	const app = document.getElementById('root')!;
	fetch('/templates/gameroom.html')
		.then(Response => Response.text())
		.then(html => {
			app.innerHTML = html;
		}) //maybe check if fetch fails idk

	const startGameBtn = document.getElementById('test-btn');
	startGameBtn?.addEventListener('click', () => {
		console.log("Starting new game...");
		startNewGame();
		startGameBtn.style.display = 'none';
	});

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                document.cookie = `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
                alert("You have been logged out.");
                window.location.reload();
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
