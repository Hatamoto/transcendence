import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { checkPending, friendRequest, FriendRequestRequest, getFriendsRequest, acceptRequest, declineRequest, friendActionRequest } from "../services/api";
import { useToast } from "./toastBar/toastContext";
import { getAllUsers, getFriends } from "../services/api";

interface UserHeaderProps {
	userName: string;
};

interface FriendRequestProps {
	id: string;
}

interface pendingRequestProps {
	name: string;
	id: number;
}

// const UserHeader: React.FC<UserHeaderProps> = ({ userName }) => {

const UserHeader: React.FC = () => {

		const toast = useToast();

		const [formState, setFormState] = useState<FriendRequestProps>({id: ''});
		const [pendingRequests, setPendingRequests] = useState<pendingRequestProps[]>([]);
	
		const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value } = event.target;
			setFormState(prevState => ({...prevState, [name]: value}));
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
				setFormState(prevState => ({...prevState, id: '',}));
			} else {
				toast.open(response.error, "error");
				setFormState(prevState => ({...prevState, id: '',}));
			}
		}

		
		const handleAccept = async (friendId: number) => {
			
			const info: friendActionRequest = {
				accToken: sessionData.accessToken,
				friendId: friendId,
			};
			
			const response = await acceptRequest(info);
			
			if (response.status === 200) {
				toast.open(response.error, "info");
				setPendingRequests((prev) => prev.filter((req) => req.id !== friendId));
			}
		}

		const handleDecline = async (friendId: number) => {

			const info: friendActionRequest = {
				accToken: sessionData.accessToken,
				friendId: friendId,
			};

			const response = await declineRequest(info);

			if (response.status === 200) {
				toast.open(response.error, "info");
				setPendingRequests((prev) => prev.filter((req) => req.id !== friendId));
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
				} // changing this to searchUsers endpoint api/users/search

				const token: getFriendsRequest = {
					accToken: sessionData.accessToken,
				}
				
				const response2 = await getFriends(token);

				if (Array.isArray(response2.users) && response2.users.length !== 0) {
					sessionStorage.setItem('friends', JSON.stringify(response2.users));
				} 
				// else {
				// 	toast.open(response2.error, "error");
				// }

				const token2: getFriendsRequest = {
					accToken: sessionData.accessToken,
				}

				const response3 = await checkPending(token2);

				if (response3.status < 204) {
					console.log("data from friend request" ,response3.data)
					toast.open("we have pending friend request", "info");
					
					setPendingRequests(response3.data);
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
		
				{pendingRequests.length > 0 && (
					<div className="w-full px-4">
						<h2 className="text-lg font-semibold mb-2 text-black">Pending Requests:</h2>
						{pendingRequests.map((req) => (
							<div key={req.id} className="flex items-center justify-between bg-white p-2 rounded mb-2">
								<span className="text-black">{req.name}</span>
								<div className="space-x-2">
									<button
										onClick={() => handleAccept(req.id)}
										className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
									>
										Accept
									</button>
									<button
										onClick={() => handleDecline(req.id)}
										className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
									>
										Decline
									</button>
								</div>
							</div>
						))}
					</div>
				)}

		</div>
		</>
	  );
}

export default UserHeader;