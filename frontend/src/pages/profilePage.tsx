import { Link } from "react-router-dom";
import { getUser } from "../services/api";

/*const ProfilePage: React.FC = () => {

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-6">
			<div className="bg-white p-6 rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
				<Link
					to="/user"
					className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
				>
					Back to user page
				</Link>
			</div>
			<>
			<p>Welcome to the profile page</p>
			</>
		</div>
	);
};

export default ProfilePage;*/

//import React from 'react';

const user = await getUser(sessionStorage.getItem('activeUserId'));

type Match = {
  id: number;
  opponent: string;
  result: 'Win' | 'Loss';
  date: string;
};

const mockMatches: Match[] = [
  { id: 1, opponent: 'PlayerOne', result: 'Win', date: '2025-04-21' },
  { id: 2, opponent: 'PlayerTwo', result: 'Loss', date: '2025-04-20' },
  { id: 3, opponent: 'PlayerThree', result: 'Win', date: '2025-04-18' },
];

const ProfilePage: React.FC = () => {

	// Calculate overall stats (wins, losses, winrate)
	const totalMatches = user.wins + user.losses;
	const winRate = totalMatches ? (user.wins / totalMatches) * 100 : 0;
	console.log(sessionStorage.getItem('activeUserId'));

	console.log(user.avatarPath);
  
	return (
	  <div className="flex min-h-screen bg-gray-100">
		{/* Left Sidebar */}
		<div className="w-96 bg-white p-6 rounded-lg shadow-md">
		  {/* Avatar & Name */}
		  <div className="flex flex-col items-center gap-3">
			<img
  				src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
			  alt="Avatar"
			  className="w-32 h-32 rounded-full border-4 border-blue-500 shadow"
			/>
			<h1 className="text-2xl font-bold text-gray-900">{user.name}</h1> 
			<p className="text-sm text-gray-500 mt-2">Sirkuspelle.</p> 
  
			{/* Online Status */}
			<div className="mt-2 text-sm text-green-500">{user.onlineStatus}</div>
		  </div>
  
		  {/* Buttons */}
		  <div className="flex flex-col gap-3 mt-6">
			<button className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-md">
			  Edit Profile
			</button>
			<button className="w-full bg-green-500 hover:bg-green-700 text-white py-2 rounded-md">
			  Friend List
			</button>
		  </div>
		</div>
  
		{/* Middle Section: Match History */}
		<div className="flex-1 bg-white p-8 mx-4 rounded-lg shadow-md flex flex-col items-center justify-start w-full">
		  {/* Overall Stats */}
		  <div className="mb-8 text-center">
			<h2 className="text-2xl font-semibold text-gray-800 mb-4">Overall Stats</h2>
			<div className="flex justify-center text-gray-600 text-lg">
			  <p className="font-medium">
				Wins: {user.wins} | Losses: {user.losses} | Winrate: {winRate.toFixed(2)}%
			  </p>
			</div>
		  </div>
  
		  {/* Match History */}
		  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Match History</h2>
			<ul className="space-y-6 w-full mx-auto">
			{mockMatches.map((match) => (
				<li
				key={match.id}
				className={`p-6 rounded-md shadow-lg ${match.result === 'Win' ? 'bg-green-100' : 'bg-red-500'}`} //red missing fainter colors
				>
				<div className="flex justify-between items-center">
					<span className="text-xl font-medium">{match.opponent}</span>
					<span className="text-lg font-bold">{match.result}</span>
				</div>
				<div className="text-sm text-gray-500">{match.date}</div>
				</li>
			))}
			</ul>
		</div>
	  </div>
	);
  };
  
  export default ProfilePage;