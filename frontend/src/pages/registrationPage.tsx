import Header from "../components/headers";
import { RegistrationRequest, registerUser } from "../services/api";
import React, { useState, useEffect } from 'react';
import { startSlimeEffect } from "../effects/slimeEffect";

interface RegistrationProps {
	username: string;
	email: string;
	password: string;
	confirm_password: string;
}

const Registration: React.FC = () => {

	useEffect(() => {
		startSlimeEffect();
	}, []);

	const [formState, setFormState] = useState<RegistrationProps>({
		username: '',
		email: '',
		password: '',
		confirm_password: ''
	});

	const [passwordError, setPasswordError] = useState<string | null>(null);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFormState(prevState => ({
			...prevState,
			[name]: value
		}));
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (formState.password !== formState.confirm_password) {
			setPasswordError('Passwords do not match');
			return;
		}
		setPasswordError(null); 

		
		const user: RegistrationRequest = {
			name: formState.username,
			email: formState.email,
			password: formState.password
		}
		console.log("asdfghassd");

		const success = await registerUser(user);
		console.log("asdfghassd");

		console.log(success);
		// if (success) {
		// 	alert('Registration worked');
		// } else {
		// 	alert('Registration failed. Please check your credentials.');
		// }
	};


	return (
		<>
			<Header />
			<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="bg-white p-6 rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
				<h1 className="text-2xl font-bold text-center mb-4 text-gray-900">Register</h1>
				<form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 items-center">
				<div className="w-64">
					<label htmlFor="username" className="block text-sm font-medium text-gray-700">
						Username
					</label>
					<input
						type="text"
						id="username"
						name="username"
						value={formState.username}
						onChange={handleInputChange}
						className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
						required
					/>
				</div>

				<div className="w-64">
					<label htmlFor="username" className="block text-sm font-medium text-gray-700">
						Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formState.email}
						onChange={handleInputChange}
						className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
						required
					/>
				</div>

				<div className="w-64">
					<label htmlFor="password" className="block text-sm font-medium text-gray-700">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						value={formState.password}
						onChange={handleInputChange}
						className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
						required
					/>
				</div>

				<div className="w-64">
					<label htmlFor="confirm password" className="block text-sm font-medium text-gray-700">
						Confirm password
					</label>
					<input
						type="password"
						id="confirm password"
						name="confirm_password"
						value={formState.confirm_password}
						onChange={handleInputChange}
						className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
						required
					/>
				</div>

				{passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}

				<button
					type="submit"
					className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
				>
					Register
				</button>
				</form>
			</div>
			</div>
		</>
	);
}

export default Registration