// socket.ts
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

export function createSocket() {
	if (!socket) {
		console.log("Creating socket");
		socket = io();
	}
}

export function closeSocket(){
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}

export function getSocket(){
	return socket;
}