import { startNewGame } from '../game/game.js';

export function loadGameRoom(): void {
    const app = document.getElementById('root')!;

    fetch('/templates/gameroom.html')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load gameroom.html: ${response.status}`);
            }
            return response.text();
        })
        .then((html) => {
            app.innerHTML = html;
        
			const startGameBtn = document.getElementById('test-btn'); 
			if (startGameBtn) {
                startGameBtn.addEventListener('click', () => {
                    console.log("Starting new game...");
                    startNewGame();
                    startGameBtn.style.display = 'none'; 
                });
            } 
			else 
                console.error('ASD');
            
			const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
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
            } else {
                console.error('ASD2.0');
            }
        })
        .catch((error) => {
            console.error("Error loading game room template:", error);
            app.innerHTML = '<h1>Error loading game room</h1>';
        });
}
