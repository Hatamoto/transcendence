import UserHeader from "../components/userHeader";
import { Link, Navigate } from 'react-router-dom';
import React from 'react';
import { useState } from "react";


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

export async function joinerTour(): Promise<number> {
	
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

	} catch (error) {
		console.error("Login error:", error);
	}
	try {
		const response = await fetch('/api/tournament/1/ready', {
			method: 'PATCH',
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

export async function starterTour(): Promise<number> {
	
	const userId = sessionStorage.getItem('activeUserId');
	
	const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	
	try {
		const response = await fetch('/api/tournament/1/start', {
			method: 'POST',
			headers: {
			'Authorization': `Bearer ${sessionData.accessToken}`
			}
		});

		const responseData = await response.json();
		console.log(responseData.error);
		console.log(responseData.bracket)

		return response.status;

	} catch (error) {
		console.error("Login error:", error);
	}
}


const TournamentsPage: React.FC = () => {
	const [showForm, setShowForm] = useState(false);
	const [showList, setShowList] = useState(false);


	const createTour = () => {
		createrTour({name: "paskaturnaus", size: 2}).then((response) => {
			if (response == 200) {
				console.log("Tournament created");
			} else {
				console.log("Tournament creation failed");
			}
		}
		);
	}

	const joinTour = () => {
		joinerTour().then((response) => {
			if (response == 200) {
				console.log("Tournament joined");
			} else {
				console.log("Tournament join failed");
			}
		}
		);
	}

	const startTour = () => {
		starterTour().then((response) => {
			if (response == 200) {
				console.log("Tournament started");
			} else {
				console.log("Tournament start failed");
			}
		}
		);
	}

	const tournaments = Array.from({ length: 200 }, (_, i) => ({
		id: i,
		name: `Tournament ${i + 1}`,
		players: `${4 + i}/${20} players`, // Latter number needs to be set to the tournaments max players
	  }));								  // first one to the current ones


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

		<button onClick={startTour} 
		id="test-start-tour" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
					start tournament
		</button>


		<Link 
					to="/tour-game"
					className="w-64 bg-blue-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
			  	>
					Go To Game page
		</Link>

		<button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
      >
        Test Create Tournament
      </button>

	  <button
        onClick={() => setShowList(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
      >
        Tournament list
      </button>

		{showForm && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <p className="text-center text-gray-600 mb-4">Tournament name</p>
            <input
              id="tour-name"
              type="text"
              placeholder="Among us Skibidi fortnite"
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            />
            <p className="text-center text-gray-600 mb-4">Tournament size</p>
            <input
              id="tour-size"
              type="text"
              placeholder="4"
              className="block w-full p-2 border border-gray-300 rounded mb-4"
            />
			<button
              onClick={() => setShowForm(false)}
              className="w-full bg-green-500 text-white p-2 rounded"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="w-full bg-red-500 text-white p-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

		{showList && (
		<div className="absolute inset-0 bg-black/60 flex items-center justify-center z-60">
			<div className="bg-white p-6 rounded-lg shadow-lg w-[480px] max-h-[80vh] flex flex-col">
			<p className="text-center text-gray-600 mb-4">Tournaments</p>

			<div className="overflow-y-auto space-y-4 pr-2 flex-grow">
				{tournaments.map((tour) => (
				<div
					key={tour.id}
					className="flex items-center justify-between border p-3 rounded"
				>
					<div className="flex items-center gap-5">
					<img
					src="/trophy.png"
					alt="icon"
					className="w-12 h-12 mt-1"
					/>	
					<div className="flex flex-col">
					<p className="font-medium">{tour.name}</p>
					<p className="text-sm text-gray-500">{tour.players}</p>
					</div>
					</div>
					<button className="bg-green-500 text-white px-3 py-1 rounded">
					Join
					</button>
				</div>
				))}
			</div>

			<button
				onClick={() => setShowList(false)}
				className="mt-4 w-full bg-red-500 text-white p-2 rounded"
			>
				Close
			</button>
			</div>
		</div>
		)}

		</>
	);
};

export default TournamentsPage;