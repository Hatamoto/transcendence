import React from "react";
import { Link } from "react-router-dom";
import { getAllUsers, User, getFriends, Friend } from "../services/api";

const response = await getAllUsers();

if (Array.isArray(response)) {
	sessionStorage.setItem('users', JSON.stringify(response));
} else {
	console.error("Error fetching users:", response);
}

const response2 = await getFriends();
if (Array.isArray(response2)) {
	sessionStorage.setItem('friends', JSON.stringify(response2));
}	else {
	console.error("Error fetching friends:", response2);
}

const UserHeader: React.FC = () => {
	
	let users: User[] = [];
	let friends: Friend[] = [];

	const usersJson = sessionStorage.getItem("users");
	const friendsJson = sessionStorage.getItem("friends");

	if (usersJson) {
		try {
			const parsed = JSON.parse(usersJson);
			if (Array.isArray(parsed)) {
				users = parsed as User[];
			}
		} catch (e) {
			console.error("Failed to parse users from sessionStorage:", e);
		}
	}

	if (friendsJson) {
		try {
			const parsed = JSON.parse(friendsJson);
			if (Array.isArray(parsed)) {
				friends = parsed as Friend[];
			}
		} catch (e) {
			console.error("Failed to parse friends from sessionStorage:", e);
		}
	}	

	return (
		<header className="bg-black text-white py-10 px-10 shadow-lg flex items-center justify-between">
		  {/* Left Side: Title and Subheading */}
		  <div className="flex items-center space-x-10">
			<h1 className="text-5xl font-extrabold tracking-tight text-green-500">
			  Welcome: 
			</h1>
		  </div>
	
		  {/* Navigation Menu */}
			<nav>
		  	<ul className="flex space-x-8">
				<li>
				<Link
					to="/"
					className="text-green-300 hover:text-green-500 transition duration-300"
				>
					Logout
				</Link>
				</li>
			</ul>
			</nav>
		</header>
	  );
}

export default UserHeader;