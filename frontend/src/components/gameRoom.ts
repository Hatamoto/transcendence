export function loadGameRoom(): void {
	const app = document.getElementById('app')!;
	app.innerHTML = `
        <div id="gameroom-page" class="bg-green-100 p-8 rounded-lg shadow-md w-96">
            <h1 class="text-2xl font-bold text-center mb-4">Welcome to the Gameroom!</h1>
            <p class="text-center text-gray-600 mb-4">You are now logged in.</p>
            <a
                href="/api/game"
                class="block w-full bg-green-500 text-white text-center py-2 rounded-md hover:bg-green-600"
            >
                Start New Game
            </a>
        </div>
    `;
}
