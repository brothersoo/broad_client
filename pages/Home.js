export default class {
    constructor() {
        document.title = "Home";
    }

    init() { }

    async getHtml() {
        return `
            <div>
                <input id="code" type="text" name="code" value="code" />
                <input id="username" type="text" name="username" value="username" />
                <input id="enter" type="button" value="Enter" data-link>
            <div>
            <div>
                <input id="newOverworldCode" type="text" value="code" />
                <input id="createOverworld" type="button" value="Create">
            </div>
        `
    }
}

window.onload = function() {
    const enterButton = document.getElementById("enter");

    enterButton.addEventListener("click", (event) => {
        const code = document.getElementById("code").value;
        const username = document.getElementById("username").value;
        history.pushState(null, null, `http://${location.host}/room/${code}/${username}`);
    })

    const createButton = document.getElementById("createOverworld");

    createButton.addEventListener("click", (event) => {
        const code = document.getElementById("newOverworldCode").value;

        const headers = { "Content-Type": "application/json" };

        const body = {
            overworldId: code,
        }

        fetch("http://localhost:3000/overworld", {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        })
        .then((response) => {
            console.log(response);
            if (response.ok) {
                alert("Create overworld succeed");
            } else {
                alert("Create overworld failed");
            }
        })
        .catch((err) => {
            console.error(err);
        })
    })
};