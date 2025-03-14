const socket = io();
var KeyBindings;
(function (KeyBindings) {
    KeyBindings["UP"] = "KeyW";
    KeyBindings["DOWN"] = "KeyS";
})(KeyBindings || (KeyBindings = {}));
class keyBind {
    constructor() {
        this.player1PosY = 30;
        this.player2PosY = 30;
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
    }
    updateGraphics() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        for (var i = 0; i <= this.gameCanvas.height; i += 30) {
            this.ctx.fillStyle = "red";
            this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 5, 15, 20);
        }
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(20, this.player1PosY, 10, 50);
        this.ctx.fillRect(580, this.player2PosY, 10, 50);
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
});
socket.on("updateGame", (playerPos) => {
    console.log("Game updated");
    keybind.player1PosY = playerPos[0];
    keybind.player2PosY = playerPos[1];
    console.log(playerPos);
    keybind.updateGraphics();
});
