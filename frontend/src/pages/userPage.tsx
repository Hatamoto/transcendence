import UserHeader from "../components/userHeader";
import { LoginRequest, loginUser } from "../services/api";
import React, { useState, useEffect } from 'react';
import FriendsList from "../components/friendsList";
import { startSlimeEffect } from "../effects/slimeEffect";


const UserPage: React.FC = () => {

	useEffect(() => {
		startSlimeEffect();
	}, []);

	return (
		<>
		<UserHeader />
		<FriendsList />
		</>
	);
};

export default UserPage;