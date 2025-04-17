import Header from "../components/headers";
import { LoginRequest, loginUser } from "../services/api";
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

interface LoginProps {
	username: string;
	password: string;
}


const Login: React.FC = () => {
	const navigate = useNavigate();
	const [captchaError, setcaptchaError] = useState<string | null>(null);

	const [formState, setFormState] = useState<LoginProps>({
		username: '',
		password: ''
	});

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFormState(prevState => ({
		  ...prevState,
		  [name]: value
		}));
	};

	const handleSubmit = async (event: React.FormEvent) => {
		const token = grecaptcha.getResponse();

		console.log("Token from grecaptcha:", token);

		if (!token) {
		  setcaptchaError("Please complete the CAPTCHA");
		  return ;
		}
		setcaptchaError(null);

		event.preventDefault();
	
		const user: LoginRequest = {
		  username: formState.username,
		  password: formState.password,
		  captchaToken: token
		};

		console.log("Calling loginUser API");
		const response = await loginUser(user, token);
		console.log("Returning from loginUser API with status:", response);

		const { userId, accessToken, refreshToken, error} = response;
		sessionStorage.setItem('activeUserId', userId.toString());

		if (response.status == 200) {
			sessionStorage.setItem(userId.toString(), JSON.stringify({accessToken, refreshToken, error}));
		} else {
			sessionStorage.setItem(userId.toString(), JSON.stringify({accessToken, refreshToken, error}));
		}
		navigate("/user");
	};
	return (
		<>
		<script src="https://www.google.com/recaptcha/api.js" async defer></script>
		  	<Header />
		 	 <div className="flex flex-col items-center justify-center min-h-screen">
				<div className="bg-white p-6 rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
			 	<h1 className="text-2xl font-bold text-center mb-4 text-gray-900">Login</h1>
				<form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 items-center">

					<div className="w-64">
						<label htmlFor="username" className="block text-sm font-medium text-gray-700">
							Username
						</label>
						<input
							type="text"
							name="username"
							value={formState.username}
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
							name="password"
							value={formState.password}
							onChange={handleInputChange}
							className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							required
						/>
					</div>
		
					<div className="g-recaptcha" data-sitekey="6LfN3xsrAAAAAOrqWYZhK-NmkYg7HbUr5X_83b59"></div>
					{captchaError && <p style={{ color: 'red' }}>{captchaError}</p>}
					<button
					type="submit"
					className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
					>
						Login
					</button>

			  	</form>
				</div>
			</div>
		</>
	);
}

export default Login
