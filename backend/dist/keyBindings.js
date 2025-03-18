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
class keyBind {
    constructor() {
        this.player1PosY = 30;
        this.player2PosY = 30; // change public to private later
        this.peerConnection = null;
        this.dataChannel = null;
        this.configuration = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302',
                } //,
                //// Optional TURN server (can be added later if needed)
                //{
                //    urls: 'turn:your-turn-server.example.com', // TURN server URL
                //    username: 'username', // Optional TURN credentials
                //    credential: 'password', // Optional TURN credentials
                //},
            ],
        };
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
        this.setupSignaling();
    }
    startWebRTC() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Initialize peer connection
                this.peerConnection = new RTCPeerConnection(this.configuration);
                // Handle ICE candidates
                this.peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log('ICE Candidate:', event.candidate);
                        socket.emit('iceCandidate', event.candidate); // Send candidate to signaling server
                    }
                };
                // Create data channel (for sending game data like player positions)
                this.dataChannel = this.peerConnection.createDataChannel('gameDataChannel');
                this.dataChannel.onopen = () => {
                    console.log('Data channel opened');
                };
                this.dataChannel.onmessage = (event) => {
                    // Handle messages from the other player
                    console.log('Message from remote:', event.data);
                };
                // Create offer and set it as local description
                const offer = yield this.peerConnection.createOffer();
                yield this.peerConnection.setLocalDescription(offer);
                console.log('Offer created and set as local description');
                // Emit the offer to the signaling server
                socket.emit('offer', offer);
            }
            catch (error) {
                console.error('Error with WebRTC setup:', error);
            }
        });
    }
    // Setup signaling for offer/answer/ice candidates
    setupSignaling() {
        // Listen for the offer from the remote peer
        socket.on('offer', (offer) => __awaiter(this, void 0, void 0, function* () {
            console.log('Offer received:', offer);
            if (this.peerConnection) {
                yield this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                console.log('Offer set as remote description');
                // Create an answer and set it as the local description
                const answer = yield this.peerConnection.createAnswer();
                yield this.peerConnection.setLocalDescription(answer);
                console.log('Answer created and set as local description');
                // Send the answer back to the signaling server
                socket.emit('answer', answer);
            }
        }));
        // Listen for the answer from the remote peer
        socket.on('answer', (answer) => __awaiter(this, void 0, void 0, function* () {
            if (this.peerConnection) {
                yield this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                console.log('Answer received');
            }
        }));
        // Listen for ICE candidates from the remote peer
        socket.on('iceCandidate', (candidate) => {
            if (this.peerConnection) {
                this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                    .then(() => {
                    console.log('ICE Candidate added');
                })
                    .catch((error) => {
                    console.error('Error adding ICE candidate:', error);
                });
            }
        });
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
    keyDown() {
        document.addEventListener('keydown', (e) => {
            keyBind.keysPressed[e.code] = true;
            socket.emit('keysPressed', keyBind.keysPressed);
        });
        document.addEventListener('keyup', (e) => {
            keyBind.keysPressed[e.code] = false;
            socket.emit('keysPressed', keyBind.keysPressed);
        });
    }
}
keyBind.keysPressed = {};
socket.on("connect", () => {
    console.log("Connected to server");
});
const keybind = new keyBind();
socket.on("startGame", () => {
    console.log("Game started");
    keybind.updateGraphics();
    keybind.keyDown();
    keybind.startWebRTC();
});
socket.on("updateGame", (posList) => {
    console.log("Game updated");
    keybind.player1PosY = posList[0][0];
    keybind.player2PosY = posList[1][0];
    keybind.ballY = posList[2][0];
    keybind.ballX = posList[2][1];
    console.log(posList);
    keybind.updateGraphics();
});
