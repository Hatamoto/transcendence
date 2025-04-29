import UserHeader from "../components/userHeader";
import React from 'react';

export interface tournament {
	name : string;
	size : number;
}

export async function createrTour(tournament): Promise<number> {
	
	const userId = sessionStorage.getItem('activeUserId');
	
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	
	try {
		const response = await fetch('/api/tournament/create', {
			method: 'POST',
			body: JSON.stringify(tournament),
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${sessionData.accessToken}`
			}
		});

		const responseData = await response.json();

		return response.status;

	} catch (error) {
		console.error("Login error:", error);
	}
}

export async function joinTour(): Promise<number> {
	
	const userId = sessionStorage.getItem('activeUserId');
	
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	
	try {
		const response = await fetch('/api/tournament/1/join', {
			method: 'POST',
			headers: {
			'Authorization': `Bearer ${sessionData.accessToken}`
			}
		});

		const responseData = await response.json();

		return response.status;

	} catch (error) {
		console.error("Login error:", error);
	}
}


const TournamentsPage: React.FC = () => {


	const createTour = () => {
		createrTour({name: "test", size: 4}).then((response) => {
			if (response == 200) {
				console.log("Tournament created");
			} else {
				console.log("Tournament creation failed");
			}
		}
		);
	}

	const ASDjoinTour = () => {
		joinTour().then((response) => {
			if (response == 200) {
				console.log("Tournament created");
			} else {
				console.log("Tournament creation failed");
			}
		}
		);
	}

	return (
		<>
		<UserHeader />
		<button onClick={createTour} 
		id="create-tour" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
					create tournament
		</button>
		<button onClick={joinTour} 
		id="test-tour" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
					join tournament
		</button>

		<button id="test-start-tour" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
					start tournament
		</button>

		{/*<button id="create-tour" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
					Create tournament
		</button>
		<details id="edit-tour">
				<summary className="cursor-pointer bg-blue-500 text-fuchsia-800 p-2 rounded">
					Open Input Fields
				</summary>
				<p className="text-center text-gray-600 mb-4">Tournament name</p>
				<input id="tour-name" type="text" placeholder="Among us Skibidi fortnite" className="block w-full p-2 border border-gray-300 rounded mt-2"/>
				<p className="text-center text-gray-600 mb-4">Tournament size</p>
				<input id="tour-size" type="text" placeholder="4" className="block w-full p-2 border border-gray-300 rounded mt-2"/>
		</details>*/}
		
		</>
	);
};

export default TournamentsPage;