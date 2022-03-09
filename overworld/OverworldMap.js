import Person from "../object/Person.js";
import utils from "../utils/utils.js";

export default class OverworldMap {
    constructor(config) {
        this.overworld = null;
        this.id = config.id;
        this.gameObjects = config.gameObjects;
        this.cutsceneSpaces = config.cutsceneSpaces || {};
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isPaused = false;

        this.playerId = config.playerId;
    }

    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y
        )
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.upperImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y
        )
    }

    isSpaceTaken(currentX, currentY, direction) {
        const {x, y} = utils.nextPosition(currentX, currentY, direction);
        return this.walls[`${x},${y}`] || false;
    }

    mountObjects() {
        Object.keys(this.gameObjects).forEach(key => {

            let object = this.gameObjects[key];
            object.id = key;

            // TODO: determine if this object should actually mount

            object.mount(this);
        });
    }

    async startCutscene(events) {
        this.isCutscenePlaying = true;

        for (let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this,
            });
            const result = await eventHandler.init();
            if (result === "LOST_BATTLE") {
                break;
            }
        }

        this.isCutscenePlaying = false;

        // Rest NPCs to do their idle behavior
        Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));
    }

    checkForActionCutscene() {
        const player = this.gameObjects[this.playerId] ;
        const nextCoords = utils.nextPosition(player.x, player.y, player.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
        });

        if (!this.isCutscenePlaying && match && match.talking.length) {
            const relevantScenario = match.talking.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf];
                });
            });
            relevantScenario && this.startCutscene(relevantScenario.events);
        }
    }

    checkForFootstepCutscene() {
        const player = this.gameObjects[this.playerId];
        const match = this.cutsceneSpaces[ `${player.x},${player.y}` ];
        if (!this.isCutscenePlaying && match) {
            this.startCutscene( match[0].events );
        }
    }

    addWall(x, y) {
        this.walls[`${x},${y}`] = true;
    }

    removeWall(x, y) {
        delete this.walls[`${x},${y}`];
    }

    moveWall(wasX, wasY, direction) {
        this.removeWall(wasX, wasY);
        const {x, y} = utils.nextPosition(wasX, wasY, direction);
        this.addWall(x, y);
    }

    updateObjectStatus(data) {
        if (data.player.id === this.playerId) {
            console.log("It's my move!");
            return;
        }

        if (data.type === "NEW_PLAYER") {
            this.gameObjects[data.player.id] = new Person({
                id: data.player.id,
                isPlayerControlled: false,
                x: data.player.x,
                y: data.player.y,
            })
            this.gameObjects[data.player.id].mount(this);
        } else if (data.type === "ACTION") {
            console.log(`Player ${data.player.id} Action`);
            this.gameObjects[data.player.id].setSubscribedData(data.player);
        }
    }
}