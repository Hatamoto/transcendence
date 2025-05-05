import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { friendRequest, FriendRequestRequest, getFriendsRequest } from "../services/api";
import { useToast } from "./toastBar/toastContext";
import { getAllUsers, getFriends } from "../services/api";

interface UserHeaderProps {
	userName: string;
};

interface FriendRequestProps {
	id: string;
}
// const UserHeader: React.FC<UserHeaderProps> = ({ userName }) => {

const UserHeader: React.FC = () => {

		const toast = useToast();

		const [formState, setFormState] = useState<FriendRequestProps>({
			id: ''
		});
	
		const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value } = event.target;
			setFormState(prevState => ({
				...prevState,
				[name]: value
			}));
		};

		const userId = sessionStorage.getItem('activeUserId');
		const sessionData = JSON.parse(sessionStorage.getItem(userId) || '{}')

		const handleSubmit = async (event: React.FormEvent) => {
			event.preventDefault();


			const user: FriendRequestRequest = {
				friendId: Number(formState.id),
				accToken: sessionData.accessToken,
			};
	  
			const response = await friendRequest(user);

			if (response.status == 200) {
				
				toast.open(response.error, "success");
			} else {
				toast.open(response.error, "error");
				
				setFormState(prevState => ({
					...prevState,
					id: '',
				}));
			}
		}
	
		const [visibleState, changeState] = useState(false);
		
		const toggleState = async () => {

			if (!visibleState) {
				
				const response = await getAllUsers();
				console.log(response.users);//test log
	
				if (Array.isArray(response.users)) {
					sessionStorage.setItem('users', JSON.stringify(response.users));
				} else {
					toast.open(response.error, "error");
					console.error("Error fetching users:", response);
				}

				const token: getFriendsRequest = {
					accToken: sessionData.accessToken,
				}
				
				const response2 = await getFriends(token);

				if (Array.isArray(response2.users)) {
					sessionStorage.setItem('friends', JSON.stringify(response2.users));
				} else {
					toast.open(response2.error, "error");
					console.error("Error fetching friends:", response2);
				}
			}
				
			changeState(prevState => !prevState);
		};

	return (
		<>
		<header className="bg-black text-white py-10 px-10 shadow-lg flex items-center justify-between">

		  <div className="flex items-center space-x-10">
			<h1 className="text-5xl font-extrabold tracking-tight text-green-500">
			  Welcome: 
			  {/* {userName} */}
			</h1>
		  </div>

			<button
				onClick={toggleState}
				className=" bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700"
			>
				{visibleState ? "Close" : "Friends"}
			</button>

		</header>

		<div
			className={`fixed top-0 left-0 w-[275px] h-full bg-gray-200 transform transition-transform duration-500 ${
			visibleState ? "translate-y-0" : "-translate-y-full"
			} flex flex-col items-center pt-8`}
		>
				<form onSubmit={handleSubmit}>
					<div className="w-11/13">
						<label htmlFor="id" className="block text-sm font-medium text-black">
							Add friends by ID
						</label>
						<input
							type="text"
							id="id"
							name="id"
							value={formState.id}
							onChange={handleInputChange}
							className="border border-black bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							required
						/>
					</div>

					<button
					type="submit"
					className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
					>
						Add
					</button>

				</form>

			</div>
		</>
	  );
}

export default UserHeader;