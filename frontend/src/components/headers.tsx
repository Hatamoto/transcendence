import React from "react";
import { Link } from "react-router-dom";

export const siteKey = "6Lf-7hwrAAAAAJfpGT5ZQUZYd-hAZVjLZx6aJEl9";

const Header: React.FC = () => {

	return (
		<header className="bg-black text-white py-10 px-10 shadow-lg flex items-center justify-between">
		  {/* Left Side: Title and Subheading */}
		  <div className="flex items-center space-x-10">
			<h1 className="text-5xl font-extrabold tracking-tight text-green-500">
			  ft_Transcendence
			</h1>
		  </div>
	
		  {/* Navigation Menu */}
		  <nav>
		  <ul className="flex space-x-8">
				<li>
				<Link
					to="/"
					className="text-green-300 hover:text-green-500 transition duration-300"
				>
					Home
				</Link>
				</li>
				<li>
				<Link
					to="/login"
					className="text-green-300 hover:text-green-500 transition duration-300"
				>
					Login
				</Link>
				</li>
				<li>
				<Link
					to="/register"
					className="text-green-300 hover:text-green-500 transition duration-300"
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
