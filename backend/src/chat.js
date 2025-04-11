

export function startChat(io, socket)
{
	socket.on("chat-message", (message) => {
		if (message.length > 50) {
			return ;
		}
		const playerRoom = [...socket.rooms][1];
		io.to(playerRoom).emit("chat-message", message);
	});
}