var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const socket = io();
var KeyBindings;
(function (KeyBindings) {
    KeyBindings["UP"] = "KeyW";
    KeyBindings["DOWN"] = "KeyS";
})(KeyBindings || (KeyBindings = {}));
class frontEndGame {
    constructor() {
        this.player1PosY = 30;
        this.player2PosY = 30; // change public to private later
        this.peerConnection = null;
        this.dataChannel = null;
        // Add a property to store candidates that arrive before remote description
        this.bufferedCandidates = [];
        this.gameCanvas = document.createElement("canvas");
        document.body.appendChild(this.gameCanvas);
        this.ctx = this.gameCanvas.getContext("2d");
        this.gameCanvas.width = 800;
        this.gameCanvas.height = 600;
        this.testbtn = document.getElementById("test-btn");
        this.testbtn.addEventListener("click", () => {
            const room = 1;
            socket.emit("joinRoom", room);
        });
        socket.on('offer', (offer) => __awaiter(this, void 0, void 0, function* () {
            if (!this.peerConnection) {
                this.peerConnection = new RTCPeerConnection(this.configuration);
                this.setupPeerConnectionEvents();
            }
            try {
                yield this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = yield this.peerConnection.createAnswer();
                yield this.peerConnection.setLocalDescription(answer);
                socket.emit('answer', answer);
                if (this.bufferedCandidates && this.bufferedCandidates.length > 0) {
                    console.log("Processing buffered ICE candidates");
                    for (const candidate of this.bufferedCandidates) {
                        yield this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    this.bufferedCandidates = [];
                }
            }
            catch (e) {
                console.error("Error handling offer:", e);
            }
        }));
        socket.on('answer', (answer) => __awaiter(this, void 0, void 0, function* () {
            yield this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }));
        socket.on('ice-candidate', (candidate) => __awaiter(this, void 0, void 0, function* () {
            if (!this.peerConnection) {
                console.warn("Received ICE candidate but peer connection not created yet");
                return;
            }
            try {
                // Buffer ICE candidates until remote description is set
                if (!this.peerConnection.remoteDescription) {
                    console.log("Buffering ICE candidate until remote description is set");
                    this.bufferedCandidates = this.bufferedCandidates || [];
                    this.bufferedCandidates.push(candidate);
                }
                else {
                    // Add ICE candidate if remote description is already set
                    yield this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log("Added ICE candidate successfully");
                }
            }
            catch (e) {
                console.error("Error adding received ICE candidate", e);
            }
        }));
    }
    setupPeerConnectionEvents() {
        // Handle incoming data channel from server
        this.peerConnection.ondatachannel = (event) => {
            console.log("Received data channel from server");
            this.dataChannel = event.channel;
            this.dataChannel.onopen = () => {
                console.log("Data channel opened");
                this.setupKeyListeners(this.dataChannel);
            };
            this.dataChannel.onclose = () => console.log("Data channel closed");
            this.dataChannel.onerror = (e) => console.error("Data channel error:", e);
            this.dataChannel.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.type === 'gameState') {
                        this.updateGameState(data.positions);
                    }
                }
                catch (err) {
                    console.error("Error handling data channel message:", err);
                }
            };
        };
        this.peerConnection.onconnectionstatechange = () => {
            console.log("Connection state:", this.peerConnection.connectionState);
        };
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", this.peerConnection.iceConnectionState);
        };
    }
    setupKeyListeners(dataChannel) {
        document.addEventListener('keydown', (e) => {
            if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
                const data = { key: e.code, isPressed: true };
                dataChannel.send(JSON.stringify(data));
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
                const data = { key: e.code, isPressed: false };
                dataChannel.send(JSON.stringify(data));
            }
        });
    }
    updateGameState(positions) {
        if (positions && positions.length >= 3) {
            // Update player 1 position
            this.player1PosY = positions[0][0];
            // Update player 2 position
            this.player2PosY = positions[1][0];
            // Update ball position
            this.ballY = positions[2][0];
            this.ballX = positions[2][1];
            // Redraw the game
            this.updateGraphics();
        }
    }
    updateGraphics() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        for (var i = 0; i <= this.gameCanvas.height; i += 30) {
            this.ctx.fillStyle = "red";
            this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 5, 15, 20);
        }
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(this.ballX, this.ballY, 20, 20);
        this.ctx.fillRect(20, this.player1PosY, 10, 50);
        this.ctx.fillRect(780, this.player2PosY, 10, 50);
        //Game.testnum
    }
}
frontEndGame.keysPressed = {};
socket.on("connect", () => {
    console.log("Connected to server");
});
const game = new frontEndGame();
socket.on("startGame", (roomId) => {
    console.log("Game started in room:", roomId);
    game.updateGraphics();
});
