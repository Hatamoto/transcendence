const socket = io();
var KeyBindings;
(function (KeyBindings) {
    KeyBindings["UP"] = "KeyW";
    KeyBindings["DOWN"] = "KeyS";
})(KeyBindings || (KeyBindings = {}));
class keyBind {
    constructor() {
        this.testbtn = document.getElementById("test-btn");
        this.testbtn.addEventListener("click", () => {
            const room = 1;
            socket.emit("joinRoom", room);
        });
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
    new keyBind();
    //requestAnimationFrame(() => keyBind.loop());
});
