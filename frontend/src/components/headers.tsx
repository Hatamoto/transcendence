import React from "react";
import { Link } from "react-router-dom";

export const siteKey = "6Lf-7hwrAAAAAJfpGT5ZQUZYd-hAZVjLZx6aJEl9";

const Header: React.FC = () => {

	return (
		<header className="bg-black text-white py-10 px-10 shadow-lg flex items-center justify-between">

		  	<div className="flex items-center space-x-10">
			<h1 className="text-5xl font-extrabold tracking-tight text-green-500">
			 	ft_transcendence
			</h1>
		  	</div>
	

			  {/* bg-black text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 px-4 py-2 */}

		  	<nav>
		  	<ul className="flex space-x-8">
				<li>
				<Link
					to="/"
					className="bg-black px-3 py-2 text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 transition duration-50"
				>
					Home
				</Link>
				</li>
				<li>
				<Link
					to="/login"
					className="bg-black px-3 py-2 text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 transition duration-50"
				>
					Login
				</Link>
				</li>
				<li>
				<Link
					to="/register"
					className="bg-black px-3 py-2 text-white rounded-md hover:bg-green-700 text-2xl font-bold border-2 border-green-500 transition duration-50"
				>
					Register
				</Link>
				</li>
			</ul>
			</nav>

		</header>
	  );
}

export default Header;
