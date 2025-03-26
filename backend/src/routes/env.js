export default async function (fastify, options) {
	fastify.get('/webrtc-config', async (request, reply) => {
		return {
			iceServers: [
				{
					urls: process.env.TURN_URL,
					username: process.env.TURN_USER,
					credential: process.env.TURN_PASS
				},
				{
					urls: process.env.STUN_URL
				}
			]
		};
	});
}