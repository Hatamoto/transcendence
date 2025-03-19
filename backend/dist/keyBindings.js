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
            }
            catch (e) {
                console.error("Error handling offer:", e);
            }
        }));
        socket.on('answer', (answer) => __awaiter(this, void 0, void 0, function* () {
            console.log("Received answer:", answer);
            yield this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }));
        socket.on('ice-candidate', (candidate) => __awaiter(this, void 0, void 0, function* () {
            console.log("Received ICE candidate:", candidate);
            if (this.peerConnection) {
                try {
                    yield this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                }
                catch (e) {
                    console.error("Error adding received ICE candidate", e);
                }
            }
        }));
    }
    createOffer() {
        this.peerConnection = new RTCPeerConnection(this.configuration);
        this.setupPeerConnectionEvents();
        this.peerConnection.createOffer()
            .then(offer => {
            this.peerConnection.setLocalDescription(offer);
            socket.emit('offer', offer);
        })
            .catch(e => console.error("Error creating offer:", e));
    }
    setupPeerConnectionEvents() {
        this.dataChannel = this.peerConnection.createDataChannel('gameData');
        this.dataChannel.onopen = () => {
            console.log("Data channel opened");
            this.setupKeyListeners(this.dataChannel);
        };
        this.dataChannel.onclose = () => console.log("Data channel closed");
        this.dataChannel.onerror = (e) => console.error("Data channel error:", e);
        this.peerConnection.onicecandidate = ({ candidate }) => {
            if (candidate) {
                console.log("Generated ICE candidate:", candidate);
                socket.emit('ice-candidate', candidate);
            }
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
keyBind.keysPressed = {};
socket.on("connect", () => {
    console.log("Connected to server");
});
const keybind = new keyBind();
socket.on("startGame", (roomId, host) => {
    console.log("Game started");
    keybind.updateGraphics();
    if (socket.id === host) {
        keybind.createOffer();
    }
});
