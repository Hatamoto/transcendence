import UserHeader from "../components/userHeader";
import React, { useState } from 'react';


const TournamentsPage: React.FC = () => {


	return (
		<>
		<UserHeader />
		<button id="create-tour" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center">
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
		</details>
		
		</>
	);
};

export default TournamentsPage;