import Person from "../object/Person.js";
import utils from "../utils/utils.js";
import OverworldMap from "./OverworldMap.js";
import MapConfig from "./MapConfig.js";
import KeyPressListener from "../KeyPressListener.js";
import DirectionInput from "../object/DirectionInput.js";

export default class Overworld {

    constructor(config) {
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext('2d');
        this.map = null;
    }

    startGameLoop() {

        const step = () => {

            // console.log(this.map.gameObjects);

            // Clear off the canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Establish the camera person
            // IDK the purpose of this object. Why not just use this.player
            // const cameraPerson = this.map.gameObjects.player;

            // Update all objects
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                    stompClient: this.stompClient,
                });
            })

            // Draw Lower Layer
            this.map.drawLowerImage(this.ctx, this.player);

            // Draw Game Objects
            Object.values(this.map.gameObjects).sort((a, b) => {
                return a.y - b.y;
            }).forEach(object => {
                object.sprite.draw(this.ctx, this.player);
            });

            // Draw Upper Layer
            this.map.drawUpperImage(this.ctx, this.player);

            if (!this.map.isPaused) {
                requestAnimationFrame(() => {
                    step();
                })
            }
        }

        step();
    }

    bindActionInput() {
        new KeyPressListener("Enter", () => {
            // Is there a person here to talk to?
            this.map.checkForChat();
        });
    }

    bindPlayerPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if (e.detail.whoId === this.player.id) {
                // Player's position has changed
                this.map.checkForFootstepCutscene();
            }
        });
    }

    startMap(config) {
        this.map = new OverworldMap(config);
        this.map.overworld = this;
        this.map.mountObjects();
    }

    connectToOverworld(overworldId) {
        return new Promise((resolve, reject) => {
            console.log("connect to overworld");
            let socket = new SockJS("http://localhost:3000/wsconnect");
            this.stompClient = Stomp.over(socket);
            const header = {
                server: overworldId
                // version: ,
                // heart-beat: ,
                // session: ,
            }

            this.stompClient.connect(header, (frame) => {

                this.stompClient.subscribe(`/topic/overworld_progress/${overworldId}`, (response) => {
                    let data = JSON.parse(response.body);
                    console.log(data);

                    this.map.updateObjectStatus(data);
                    // TODO : catch error and reject
                });

                console.log("connected to the frame: " + frame);

                resolve();
            });
        })
    }

    loadOtherPlayers(overworldData) {
        return new Promise((resolve, reject) => {
            fetch(`http://localhost:3000/players/${overworldData.id}`)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (data.players) {
                    [overworldData.gameObjects, data.players].reduce((r, o) => {
                        Object.keys(o).forEach((key) => {
                            if (key != this.player.id) {
                                overworldData.gameObjects[key] = new Person({
                                    id: key,
                                    isPlayerControlled: false,
                                    x: o[key].x,
                                    y: o[key].y,
                                });
                            }
                        })
                    })
                }

                resolve(overworldData);
            })
            .catch((err) => {
                reject(err);
            });
        })
    }

    async init(overworldId, username) {

        this.player = new Person({
            // id: sessionStorage.getItem("broadId") || 1,
            id: username,
            isPlayerControlled: true,
            x: utils.withGrid(5),
            y: utils.withGrid(6),
        })

        this.connectToOverworld(overworldId, this.player)
        .then(() => {
            console.log("connected to overworld");

            // player.publishEvent(overworldId, this.stompClient, "NEW_ENTRANCE");

            const overworldData = MapConfig.GreenRoom;
            overworldData.id = overworldId;
            overworldData.gameObjects[this.player.id] = this.player;

            overworldData.playerId = this.player.id;

            this.loadOtherPlayers(overworldData)
            .then((data) => {
                this.startMap(overworldData);

                ///// ******************************* /////
                console.log("publishing event start");
                console.log(this.player.getPublishData());

                this.stompClient.send(`/app/newPlayer/${overworldId}`, {}, JSON.stringify(this.player.getPublishData()));

                console.log("publishing event finished");
                ///// ******************************* /////

                this.bindActionInput();
                this.bindPlayerPositionCheck();

                this.directionInput = new DirectionInput();
                this.directionInput.init();

                // Kick off the game!
                this.startGameLoop();
            })
            .catch((err) => {
                console.error(err);
            })
        })
    }
}