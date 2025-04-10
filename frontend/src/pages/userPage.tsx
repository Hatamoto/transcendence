import UserHeader from "../components/userHeader";
import { LoginRequest, loginUser } from "../services/api";
import React, { useState } from 'react';
import FriendsList from "../components/friendsList";


const UserPage: React.FC = () => {


	return (
		<>
		<UserHeader />
		<FriendsList />
		</>
	);
};

export default UserPage;