import { loadLoginForm } from '../components/loginForm.js';
import { loadGameRoom } from '../components/gameRoom.js';
import { Logger, LogLevel } from '../utils/logger.js';

const log = new Logger(LogLevel.INFO);

log.info("Game init"); // test

window.addEventListener('DOMContentLoaded', () => {
	// Show login form by default
	loadLoginForm();

	// Check if accessToken exists in cookies
	const cookies = document.cookie.split(';').reduce((acc, cookie) => {
		const [key, value] = cookie.trim().split('=');
		acc[key] = value;
		return acc;
	}, {} as Record<string, string>);

	// Auto-load game room if token exists
	if (cookies.accessToken) {
		loadGameRoom();
	}
});