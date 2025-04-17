import socket from '../utils/socket.js';
import { Logger, LogLevel } from '../utils/logger.js';

const log = new Logger(LogLevel.INFO);

export function setupButtons()
{
	// Normal matchmaking
	const testBtn = document.getElementById("test-btn");
	
	if (testBtn)
	{
		testBtn.addEventListener("click", () => {
			socket.emit("joinRoomQue");
		});
	}

	// Tournament matchmaking
	const readyBtn = document.getElementById("ready-tour");
	if (readyBtn)
	{
		readyBtn.addEventListener("click", () => {
			socket.emit("readyTour");
		});
	}
}