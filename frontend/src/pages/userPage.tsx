import UserHeader from "../components/userHeader";
import React, { useEffect } from 'react';
import FriendsList from "../components/friendsList";
import { useNavigate } from "react-router-dom";

const UserPage: React.FC = () => {

	const navigate = useNavigate();
	useEffect(() => {
		const checkAccess = async () => {
			const userId = sessionStorage.getItem('activeUserId');
			if (!userId) {
				navigate('/login');
				//message component to inform user
				return ;
			}
			const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')
			const token = sessionData.accessToken;

			if (!token) {
				navigate('/login');
				//message component to inform user
				return ;
			}

			try {
				const response = await fetch('backend/api', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (!response.ok) {
					navigate('/login');
					//message component to inform user
				}
			} catch (error) {
				navigate('/login');
				//message component to inform user
			};
		}
		checkAccess();
	}, [navigate]);

	return (
		<>
		<UserHeader />
		<FriendsList />
		</>
	);
};

export default UserPage;