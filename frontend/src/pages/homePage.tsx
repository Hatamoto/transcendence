import { Link } from 'react-router-dom';
import Header from "../components/headers.js";
import { useNavigate } from "react-router-dom";
// import { useEffect } from 'react';

const Home: React.FC = () => {

	const navigate = useNavigate();

	const handleGoogleLogin = () => {

		const popup = window.open(
		  'http://localhost:4000/api/googleauth',
		  'GoogleLogin',
		  'width=500,height=600'
		);
	  
		window.addEventListener('message', (event) => {

		if (event.origin !== "http://localhost:4000")
			return;
	
		const { userId, accessToken, refreshToken } = event.data;
	
			if (userId && accessToken) {
				sessionStorage.setItem("activeUserId", userId);
				sessionStorage.setItem(
					userId,
					JSON.stringify({
						accessToken,
						refreshToken,
						error: "Google signin successful",
					})
				);
				navigate("/user");
			}
		console.log('User is now logged in');

		});
	}
	
	return (
		<>
		<Header />
			<div className="flex flex-col items-center justify-center min-h-screen">
			<div className="bg-white p-6 rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
			  	<Link 
					to="/game"
					className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
			  	>
					Demo Game
			  	</Link>
			  	<Link 
					to="/login"
					className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
			  	>
					Login
			 	</Link>
			  	<Link 
					to="/register"
					className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
			  	>
					Register
			  	</Link>
				  <p className="text-gray-700">Or</p>
				<button 
					onClick={handleGoogleLogin}
					className="w-64 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-900 text-center"
				>
					Sign in with Google
				</button>
			</div>
			</div>
		</>
	);
}

export default Home
