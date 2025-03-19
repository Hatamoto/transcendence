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
        //this.peerConnection.onicecandidate = ({ candidate }) => {
        //	if (candidate) {
        //		socket.emit('ice-candidate', candidate);
        //	}
        //};
        socket.on('ice-candidate', (candidate) => __awaiter(this, void 0, void 0, function* () {
            console.log("Received ice candidate");
            this.peerConnection.addIceCandidate(candidate);
        }));
        socket.on('offer', (offer) => __awaiter(this, void 0, void 0, function* () {
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            this.peerConnection.createAnswer()
                .then(answer => {
                this.peerConnection.setLocalDescription(answer);
                socket.emit('answer', answer);
            });
        }));
        socket.on('answer', (answer) => __awaiter(this, void 0, void 0, function* () {
            yield this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }));
    }
    createOffer() {
        this.peerConnection = new RTCPeerConnection(this.configuration);
        this.peerConnection.createOffer()
            .then(offer => {
            this.peerConnection.setLocalDescription(offer);
            socket.emit('offer', offer);
        });
    }
    //public sendGameData(): void {
    //    if (this.dataChannel && this.dataChannel.readyState === 'open') {
    //        // Send player positions or any game-related data
    //        const gameData = {
    //            player1PosY: this.player1PosY,
    //            player2PosY: this.player2PosY,
    //            ballX: this.ballX,
    //            ballY: this.ballY
    //        };
    //        this.dataChannel.send(JSON.stringify(gameData));
    //    }
    //}
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
    if (socket.id === host)
        keybind.createOffer();
});
//socket.on("updateGame", (posList : number[]) => {
//	console.log("Game updated");
//	keybind.player1PosY = posList[0][0];
//	keybind.player2PosY = posList[1][0];
//	keybind.ballY = posList[2][0];
//	keybind.ballX = posList[2][1];
//	console.log(posList);
//	keybind.updateGraphics();
//});
