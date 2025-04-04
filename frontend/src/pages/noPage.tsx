import { Link } from "react-router-dom";

export default function NoPage() {

	return (
		<>
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="bg-white p-6 rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
				<h1 className="text-2xl font-bold text-center mb-4 text-gray-900">Error 404 : Not Found</h1>
				<Link
					to="/home"
					className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
				>
					Go back to Home
				</Link>
				</div>
			</div>
		</>
	);
}
