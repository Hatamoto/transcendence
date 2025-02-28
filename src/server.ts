import Fastify from "fastify";
import path from "path";
import { dbPlugin } from './database';
import { createServer } from './googleauth/createServer';

const fastify = Fastify({ logger: true });

// Register fastify-static to serve static files (game.js)
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});

fastify.register(dbPlugin);

// Declare a route to serve the HTML page with the canvas
fastify.get("/", async (request, reply) => {
  return reply.type('text/html').send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Game</title>
      </head>
      <body>
        <h1>Welcome to the Game!</h1>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        <script type="text/javascript" src="/src/Game/game.js"></script>
      </body>
    </html>
  `);
});

// Start the Fastify server
async function startServer() {
//  try {
//    await fastify.listen({ port: 3000 });
//    console.log("Server running on http://localhost:3000");
//  } catch (err) {
//    fastify.log.error(err);
//    process.exit(1);
//  }

  const server = await createServer();

  // Also you can save these values in the .env file
  // Like POST, HOST, ...
  await server.listen({
	  port: 8000,
	  host: "localhost",
  });
}

startServer();
