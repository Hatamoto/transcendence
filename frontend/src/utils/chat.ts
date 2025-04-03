import socket from './socket.js';

export function startChat()
{
	const chatContainer = document.getElementById('chat-container')!;
	const chatBox = document.getElementById('chat-box') as HTMLInputElement;
	const sendButton = document.getElementById('send-btn')!;
	const messages = chatContainer.getElementsByTagName('p');

	sendButton.addEventListener('click', () => {
		const message = chatBox.value;
		if (message && message.length <= 50) {
			socket.emit('chat-message', message);
			chatBox.value = '';
		}
	});

	socket.on('chat-message', (message: string) => {
		const chatMessage = document.createElement('p');
		chatMessage.textContent = message;
		chatContainer.appendChild(chatMessage);
		if (messages.length > 5) {
			chatContainer.removeChild(messages[0]);
		}
	});
}