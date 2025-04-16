import socket from '../utils/socket.js';
import { Logger, LogLevel } from '../utils/logger.js';

const log = new Logger(LogLevel.INFO);

export function setupButtons()
{
	// Normal matchmaking
	const testBtn = document.getElementById("test-btn");
	
	testBtn.addEventListener("click", () => {
		socket.emit("joinRoomQue");
	});

	// Tournament matchmaking
	const readyBtn = document.getElementById("ready-tour");
	readyBtn.addEventListener("click", () => {
		socket.emit("readyTour");
	});
}