import UserHeader from "../components/userHeader";
import React, { useEffect, useState } from 'react'; // useState, add the check
import FriendsList from "../components/friendsList";
import { useNavigate } from "react-router-dom";
import { LogoutRequest, logoutUser } from "../services/api";

const UserPage: React.FC = () => {

	console.log("arriving at user Page");
	const navigate = useNavigate();
	useEffect(() => {
		const checkAccess = async () => {
			const userId = sessionStorage.getItem('activeUserId');
			if (!userId) {
				navigate('/login'); //if we try to go to /user page without trying to log in.
				return ;
			}
			const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
			const token = sessionData.accessToken;
			
			if (!token) {
				navigate('/login');
				console.log(sessionData.error); // is the dev environment the cause of dubble logs? // change this to popup bar (component)
				// sessionStorage.clear(); // check after you have logged in if this is effing things up
			}
			console.log(sessionData.accessToken);
			console.log(sessionData.refreshToken);
		}
		checkAccess();
	}, [navigate]);

	const handleLogout = async (event: React.MouseEvent) => {

			event.preventDefault();
		
			const userId = sessionStorage.getItem('activeUserId');

			const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')

			const user: LogoutRequest = {
				token: sessionData.refreshToken
			};

			console.log("Calling logoutUser API");
			const response = await logoutUser(user);
			console.log("Returning from logoutUser API with status:", response);
	
			if (response.status == 204) {
				sessionStorage.clear();
				console.log(response.error)
				navigate("/home");
			} else {
				console.log(response.error)
			}
			
	};
	
	return (
		<>
		<UserHeader />
		<FriendsList />
			<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="bg-black p-6 text-white rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
				<button onClick={handleLogout} className="w-full flex flex-col gap-4 items-center">
					Logout
				</button>
			</div>
			</div>

		</>
	);
};

export default UserPage;