import { Link } from "react-router-dom";

const ProfilePage: React.FC = () => {

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-6">
			<div className="bg-white p-6 rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
				<Link
					to="/user"
					className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
				>
					Back to user page
				</Link>
			</div>
			<>
			<p>Welcome to the profile page</p>
			</>
		</div>
	);
};

export default ProfilePage;