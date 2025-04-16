import socket from '../utils/socket.js';
import { Logger, LogLevel } from '../utils/logger.js';

const log = new Logger(LogLevel.INFO);

export function setupButtons()
{
	// Normal matchmaking
	const testbtn = document.getElementById("test-btn");
	
	testbtn.addEventListener("click", () => {
		socket.emit("joinRoomQue");
	});

	// Tournament matchmaking
	
}