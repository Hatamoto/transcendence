import UserHeader from "../components/userHeader";
import React, { useEffect, useState } from 'react'; // useState, add the check
import FriendsList from "../components/friendsList";
import { useNavigate, Link } from "react-router-dom";
import { LogoutRequest, logoutUser } from "../services/api";
import { deleteUser, DeleteUserRequest } from "../services/api";
import { useToast } from "../components/toastBar/toastContext";

const UserPage: React.FC = () => {

	const navigate = useNavigate();
	const toast = useToast();

	// useEffect(() => {
	// 	const checkAccess = async () => {
	// 		const userId = sessionStorage.getItem('activeUserId');
	// 		if (!userId) {
	// 			toast.open("Unauthorized", "error");
	// 			navigate('/login'); //if we try to go to /user page without trying to log in.
	// 			return ;
	// 		}
	// 		const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	// 		const token = sessionData.accessToken;
			
	// 		if (!token) {
	// 			toast.open(sessionData.error, "error");
	// 			navigate('/login');
	// 			// console.log(sessionData.error); // is the dev environment the cause of dubble logs? // change this to popup bar (component)
	// 			// sessionStorage.clear(); // check after you have logged in if this is effing things up
	// 		}
	// 		// console.log(sessionData.accessToken);
	// 		// console.log(sessionData.refreshToken);// information print
	// 		// toast.open(sessionData.error, "success");
	// 	}
	// 	checkAccess();
	// }, [navigate]);

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
	
			if (response.status === 204) {
				sessionStorage.clear();
				toast.open(response.error, "success");
				// console.log(response.error)
				navigate("/home");
			} else {
				toast.open(response.error, "error");
				// console.log(response.error)
			}
			
	};

	const handleUserDelete = async (event: React.MouseEvent) => {
	
		event.preventDefault();
	
		const userId = sessionStorage.getItem('activeUserId');
	
		const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
	
		const user: DeleteUserRequest = {
			id: Number(userId),
			accToken: sessionData.accessToken,
			token: sessionData.refreshToken,
			captchaToken: sessionData.captchaToken,
		};
	
		console.log("Calling deleteUser API");
		const response = await deleteUser(user);
		console.log("Returning from deleteUser API with status:", response);
	
		if (response.status === 200) {
			sessionStorage.clear();
			toast.open(response.error, "success");
			// console.log(response.error)
			navigate("/home");
		} else {
			toast.open(response.error, "error");
			// console.log(response.error)
		}			
	};
	
	return (
		<>
		<UserHeader />
		<FriendsList />
		<div className="flex flex-col items-center justify-center min-h-screen gap-6">
			<div className="bg-black p-6 text-white rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
			<button 
				onClick={handleLogout} 
				className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
				>
				Logout
			</button>
			</div>
			<div className="bg-black p-6 text-white rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
			<button 
				onClick={handleUserDelete} 
				className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
				>
				Delete User
			</button>
			</div>

			<div className="bg-black p-6 rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
				<Link
					to="/user/profile"
					className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
				>
					Profile page
				</Link>
			</div>

		</div>
		</>
	);
};

export default UserPage;