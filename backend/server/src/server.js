import dotenv from "dotenv"
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes, friendRoutes } from './routes/routes.js'
import dbInit from './database.js'
import path from 'path'
import cookie from '@fastify/cookie'
import formbody from '@fastify/formbody'
import ejs from 'ejs'
import view from '@fastify/view'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { fileURLToPath } from 'url';
import { setupNetworking } from './networking.js';
import { Logger, LogLevel } from './utils/logger.js';


// Compute __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIST = path.resolve(__dirname, '../../../frontend/dist');

const log = new Logger(LogLevel.INFO);

log.info("Creating server")
log.info("DIST:::: " + FRONTEND_DIST);

dotenv.config({ path: "../.env" });

const fastify = Fastify({
	logger: false
})

fastify.register(view, {
  engine: {
    ejs: ejs,
  },
})

// fastify.setTrustProxy(true); for web reverse proxy

const server = fastify.server;
setupNetworking(server);

// Serve frontend files
fastify.register(fastifyStatic, {
    root: FRONTEND_DIST,
    prefix: '/',
});

// Serve avatars
fastify.register(fastifyStatic, {
    root: path.join(__dirname, './avatars'),
    prefix: '/avatars/',
    decorateReply: false,
});

fastify.register(jwt, {
    secret: process.env.ACCESS_TOKEN_SECRET,
});

fastify.setNotFoundHandler((req, reply) => {
    reply.sendFile('index.html', { root: FRONTEND_DIST });
});

await Promise.all([
  fastify.register(dbInit),
  fastify.register(formbody),
  fastify.register(cookie),
  fastify.register(multipart),
  fastify.register(root),
  fastify.register(userRoutes),
  fastify.register(friendRoutes),
])

  

fastify.listen({ port: process.env.PORT || 5001, host: process.env.HOST }, function (err, address) {
	log.info('Listening on port', process.env.PORT);
	if (err) {
		log.info('Error: ', err)
		fastify.log.error(err)
		process.exit(1)
	}
	log.info(`Server listening at ${address}`)
})



//	const handleSubmit = async (event: React.FormEvent) => {
//		event.preventDefault();
//		const token = grecaptcha.getResponse();

//		if (!token) {
//		  alert("Please complete the CAPTCHA");
//		  return;
//		}
	  
//		const response = await fetch('/register', {
//		  method: 'POST',
//		  headers: {
//			'Content-Type': 'application/json',
//		  },
//		  body: JSON.stringify({
//			username: formState.username,
//			password: formState.password,
//			token: token,
//		  }),
//		});
	  
//		//const data = await response.json();

	
//		const user: LoginRequest = {
//		  username: formState.username,
//		  password: formState.password
//		};

//		try {
//			const success = await loginUser(user);
	  
//			if (success) {
//				navigate("/user");
//			} else {
//				alert('Login failed. Please check your credentials.');
//			}
//		} catch (error) {
//			console.error('Error logging in: ', error);
//			alert('Something went wrong. Please try again later.');
//		}

//	};
//	return (
//		<>
//		  	<Header />
//		 	 <div className="flex flex-col items-center justify-center min-h-screen">
//				<div className="bg-white p-6 rounded-lg w-96 flex flex-col gap-4 items-center shadow-md">
//			 	<h1 className="text-2xl font-bold text-center mb-4 text-gray-900">Login</h1>
//				 <form onSubmit={handleSubmit} method="POST" className="w-full flex flex-col gap-4 items-center">
//				 <div className="w-64">
//					<label htmlFor="username" className="block text-sm font-medium text-gray-700">
//						Username
//					</label>
//					<input
//						type="text"
//						name="username"
//						value={formState.username}
//						onChange={handleInputChange}
//						className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//						required
//					/>
//				</div>

//				<div className="w-64">
//					<label htmlFor="password" className="block text-sm font-medium text-gray-700">
//						Password
//					</label>
//					<input
//						type="password"
//						name="password"
//						value={formState.password}
//						onChange={handleInputChange}
//						className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
//						required
//					/>
//				</div>
//				<div className="g-recaptcha" data-sitekey="6LfN3xsrAAAAAOrqWYZhK-NmkYg7HbUr5X_83b59"></div>
//				<button
//				  type="submit"
//				  className="w-64 bg-green-500 text-white py-2 rounded-md hover:bg-green-700 text-center"
//				>
//				  	Login
//				</button>
//			  	</form>
//			</div>
//		 	</div>
//			<script src="https://www.google.com/recaptcha/api.js" async defer></script>
//		</>
//	);
//}