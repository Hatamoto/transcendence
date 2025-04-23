import Header, { siteKey } from "../components/headers";
import { LoginRequest, loginUser } from "../services/api";
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

interface LoginProps {
	username: string;
	password: string;
}

const Login: React.FC = () => {
	const navigate = useNavigate();
	const [captchaError, setcaptchaError] = useState<string | null>(null);
	const [captchaToken, setCaptchaToken] = useState("");
	const [showCaptcha, setCaptcha] = useState(false);

	useEffect(() => {
		setCaptcha(false);
	}, []);
	
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
		event.preventDefault();

		if (!captchaToken && !showCaptcha)
		{
			setCaptcha(true);
			return;
		}

		if (!captchaToken) {
		  setcaptchaError("Please complete the CAPTCHA");
		  return ;
		}
		setcaptchaError(null);
	
		const user: LoginRequest = {
		  username: formState.username,
		  password: formState.password,
		  captchaToken: captchaToken
		};

		const response = await loginUser(user, captchaToken);

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
					{showCaptcha && 
					<ReCAPTCHA
						sitekey={siteKey}
						onChange={(token) => {
							setcaptchaError(null);
							setCaptchaToken(token || "");
						}}
					/> }
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
