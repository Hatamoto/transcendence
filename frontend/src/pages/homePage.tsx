import { Link } from 'react-router-dom';
import Header from "../components/headers.js";

const Home: React.FC = () => {

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
				<p>Or</p>
				<Link
					to="http://localhost:4000/api/googleauth"
					className="w-64 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-900 text-center"
				>
					Sign in with Google
				</Link>
			</div>
			</div>
		</>
	);
}

export default Home
