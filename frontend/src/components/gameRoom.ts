import { createNewGame } from '../game/frontEndGame.js';
import { startChat } from '../utils/chat.js';
import { Logger, LogLevel } from '../utils/logger.js';

const log = new Logger(LogLevel.INFO);

export function loadGameRoom(): void {
	const app = document.getElementById('app')!;
	app.innerHTML = `
        <div id="gameroom-page" class="bg-green-100 p-8 rounded-lg shadow-md w-[820px]">
            <h1 class="text-2xl font-bold text-center mb-4">Welcome to the Gameroom!</h1>
            <p class="text-center text-gray-600 mb-4">You are now logged in.</p>
            <p id="size-txt" class="text-center text-gray-600 mb-4">Lobby size: 0/2</p>
			<!-- Start New Game Button -->
			<button id="test-btn" 
					class="block w-full bg-green-500 text-white text-center py-2 rounded-md hover:bg-green-600">
				Start New Game
			</button>
			<label for="colorSelect">Choose ball color:</label>
			<select id="colorSelect" name="mySelect">
				<option value="white" selected>White</option>
				<option value="green">Green</option>
				<option value="blue">Blue</option>
				<option value="red">Red</option>
				<option value="purple">Purple</option>
			</select>
			</button>
			<button id="start-btn"
					class="hidden w-full bg-red-500 text-white text-center py-2 rounded-md hover:bg-green-600">
				Start The Game
			</button>
			<details id="edit-game" class="hidden">
				<summary class="cursor-pointer bg-blue-500 text-white p-2 rounded">
					Open Input Fields
				</summary>
				<p class="text-center text-gray-600 mb-4">Ball size</p>
				<input id="ball-size" type="text" placeholder="20" class="block w-full p-2 border border-gray-300 rounded mt-2">
				<p class="text-center text-gray-600 mb-4">Ball speed</p>
				<input id="ball-speed" type="text" placeholder="3" class="block w-full p-2 border border-gray-300 rounded mt-2">
			</details>
            <!-- Logout Button -->
            <button 
                id="logout-btn"
                class="mt-4 block w-full bg-red-500 text-white text-center py-2 rounded-md hover:bg-red-600"
            >
                Logout
            </button>
        </div>
		<div id="game-container" class="bg-green-100 p-2 rounded-lg shadow-md mt-4 w-[820px] h-[620px]"></div>
		<div id="chat-container" class="bg-green-900 p-2 rounded-lg shadow-md mt-4 w-[400px] h-[620px] fixed top-4 right-4">
		<input id="chat-box" type="text" placeholder="" class="block w-full p-2 border border-gray-300 rounded mt-2" maxlength="50">
		<button id="send-btn"
			class="w-full bg-purple-500 text-white text-center py-2 rounded-md hover:bg-green-600">
			Send
		</button>
		</div>
    `;

	createNewGame();
	startChat();

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
            log.error("Logout Error:", error);
            alert("Network error during logout.");
        }
    });
}
