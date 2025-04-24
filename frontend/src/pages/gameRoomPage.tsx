import Header from "../components/headers";
import { createNewGame } from "../game/frontEndGame";
import { useEffect, useRef } from "react";
import { io, Socket } from 'socket.io-client';
import { createSocket, getSocket } from "../utils/socket";

export default function GameRoom({matchType}) {

	const hasRun = useRef(false);
	let socket: Socket | null = null;

	useEffect(() => {
		if (!hasRun.current) {
			 if (matchType != "solo")
				createSocket();
			createNewGame(matchType, getSocket());
			hasRun.current = true;
	  	}
	}, []);

	const matchTypeButtons = () => {
		switch (matchType) {
			case "solo":
				return(
					<>
					<p id="size-txt" className="text-center text-gray-600 mb-4">Lobby size: 1/1</p>
					<h1 className="text-2xl font-bold text-center mb-4">Welcome to the Solo Game!</h1>
					<button id="ready-solo" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
						Start!
					</button>
					</>
				);
			case "tournament":
				return(
					<>
					<p id="size-txt" className="text-center text-gray-600 mb-4">Lobby size: 0/2</p>
					<h1 className="text-2xl font-bold text-center mb-4">Welcome to the Tournament!</h1>
					<button id="ready-tour" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
						Ready up!
					</button>
					</>
				);
			case "normal":
				return(
					<>
					<p id="size-txt" className="text-center text-gray-600 mb-4">Lobby size: 0/2</p>
					<h1 className="text-2xl font-bold text-center mb-4">Welcome to the Gameroom!</h1>
					<button id="ready-match" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
						Start Matchmaking!
					</button>
					</>
				);
			default:
			return (<p>FUCK OFF</p>);
		}
	};

	return (
		<>
			<Header />
			<div id="gameroom-page" className="bg-green-100 p-8 rounded-lg shadow-md w-[820px]">				
				{matchTypeButtons()}

				<label htmlFor="colorSelect">Choose ball color:</label>
				<select id="colorSelect" name="mySelect" defaultValue="white">
					<option value="white" >White</option>
					<option value="green">Green</option>
					<option value="blue">Blue</option>
					<option value="red">Red</option>
					<option value="purple">Purple</option>
				</select>

				<button id="start-btn" hidden className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
					Start The Game
				</button>

				<details id="edit-game" hidden>
					<summary className="cursor-pointer bg-blue-500 text-fuchsia-800 p-2 rounded">
						Open Input Fields
					</summary>
					<p className="text-center text-gray-600 mb-4">Ball size</p>
					<input id="ball-size" type="text" placeholder="20" className="block w-full p-2 border border-gray-300 rounded mt-2"/>
					<p className="text-center text-gray-600 mb-4">Ball speed</p>
					<input id="ball-speed" type="text" placeholder="3" className="block w-full p-2 border border-gray-300 rounded mt-2"/>
				</details>
			</div>

			<div id="game-container" className="bg-green-100 p-2 rounded-lg shadow-md mt-4 w-[820px] h-[620px]"></div>

			{/*<div id="chat-container" className="bg-green-900 p-2 rounded-lg shadow-md mt-4 w-[400px] h-[620px] fixed top-4 right-4">
				<input id="chat-box" type="text" placeholder="" className="block w-full p-2 border border-gray-300 rounded mt-2" maxLength="50"/>
				<button id="send-btn"className="w-full bg-purple-500 text-white text-center py-2 rounded-md hover:bg-green-600">
					Send
				</button>
			</div>*/}
		</>
	);
}