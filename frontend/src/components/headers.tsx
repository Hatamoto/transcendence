import React from "react";

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
				<a
				  href="/"
				  className="text-green-300 hover:text-green-500 transition duration-300"
				>
				  Home
				</a>
			  </li>
			  <li>
				<a
				  href="/login"
				  className="text-green-300 hover:text-green-500 transition duration-300"
				>
				  Login
				</a>
			  </li>
			  <li>
				<a
				  href="/register"
				  className="text-green-300 hover:text-green-500 transition duration-300"
				>
				  Register
				</a>
			  </li>
			</ul>
		  </nav>
		</header>
	  );
}

export default Header;
