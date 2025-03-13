const socket = io();
var KeyBindings;
(function (KeyBindings) {
    KeyBindings["UP"] = "KeyW";
    KeyBindings["DOWN"] = "KeyS";
})(KeyBindings || (KeyBindings = {}));
class keyBind {
    constructor() {
        document.addEventListener('keydown', (e) => {
            keyBind.keysPressed[e.code] = true;
        });
        document.addEventListener('keyup', (e) => {
            keyBind.keysPressed[e.code] = false;
        });
    }
    static loop() {
        console.log("Working");
        socket.emit('keysPressed', keyBind.keysPressed);
        requestAnimationFrame(() => keyBind.loop());
    }
}
keyBind.keysPressed = {};
socket.on("connect", () => {
    console.log("Connected to server");
    new keyBind();
    requestAnimationFrame(() => keyBind.loop());
});
