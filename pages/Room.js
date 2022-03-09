import Overworld from "../overworld/Overworld.js";

export default class {
    constructor() {
        document.title = "Room";
    }

    parsePath(path) {
        const parsedPath = path.split("/");
        return [parsedPath[parsedPath.length - 2], parsedPath[parsedPath.length - 1]];
    }

    init() {
        const [overworldId, username] = this.parsePath(location.pathname);
        const overworld = new Overworld({
            element: document.querySelector(".game-container")
        });
        overworld.init(overworldId, username);
    }

    async getHtml() {
        return `
            <div class="game-container">
                <canvas class="game-canvas" width="352" height="198"></canvas>
            </div>
        `
    }
}


// $(function() {
//     if (sessionStorage.getItem("jwt")) {
//         if (!window.WebSocket) {
//             alert("No WebSocket!");
//             return;
//         }

//         connect = () => {
//             ws = new WebSocket("ws://localhost:2000/overworld/connect");
//             ws.onopen = (e) => {
//                 console.log("onopen", arguments);
//             };
//             ws.onclose = (e) => {
//                 console.log("onclose", arguments);
//             };
//             ws.onmessage = (e) => {
//                 console.log("onmessage", arguments);
//             };
//         }

//         connect();

//         // const overworld = new Overworld({
//         //     element: document.querySelector(".game-container")
//         // });
//         // overworld.init();
//     } else {
//         console.log("not authorized");
//     }
// });