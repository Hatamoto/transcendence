import { getSocket } from '../utils/socket.js';
import { Logger, LogLevel } from '../utils/logger.js';
import { startSoloGame } from './frontEndGame.js';

const log = new Logger(LogLevel.INFO);

export function setupButtons(socket)
{
	// Solo game
	const soloBtn = document.getElementById("ready-solo");
	
	if (soloBtn)
	{
		const gameEdit = document.getElementById("edit-game");

		gameEdit.hidden = false;
		soloBtn.addEventListener("click", () => {
			startSoloGame();
		});
	}

	// Normal matchmaking
	const matchBtn = document.getElementById("ready-match");
	
	if (matchBtn)
	{
		matchBtn.addEventListener("click", () => {
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