import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { friendRequest, FriendRequestRequest } from "../services/api";
import { useToast } from "./toastBar/toastContext";

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

		const handleSubmit = async (event: React.FormEvent) => {
			event.preventDefault();

			const user: FriendRequestRequest = {
				id: formState.id
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
		
		const toggleState = () => {
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