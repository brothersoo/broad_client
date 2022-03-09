class OverworldEvent {
    constructor({ event, map }) {
        this.event = event;
        this.map = map;
    }

    stand(resolve) {
        const who = this.map.gameObjects[ this.event.who ];
        who.startBehavior({
            map: this.map
        }, {
            type: "stand",
            direction: this.event.direction,
            time: this.event.time
        });

        // Set up a handler to complete when correct person is done walking, then resolve the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonStandComplete", completeHandler);
                resolve();
            }
        }

        document.addEventListener("PersonStandComplete", completeHandler);
    }

    walk(resolve) {
        const who = this.map.gameObjects[ this.event.who ];
        who.startBehavior({
            map: this.map
        }, {
            type: "walk",
            direction: this.event.direction,
            retry: true,
        });

        // Set up a handler to complete when correct person is done walking, then resolve the event
        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonWalkingComplete", completeHandler);
                resolve();
            }
        }

        document.addEventListener("PersonWalkingComplete", completeHandler);
    }

    textMessage(resolve) {

        if (this.event.facePlayer) {
            const obj = this.map.gameObjects[this.event.facePlayer];
            obj.direction = utils.oppositeDirection(this.map.gameObjects[this.map.playerId].direction);
        }

        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve()
        });
        message.init( document.querySelector(".game-container") );
    }

    changeMap(resolve) {

        const sceneTransition = new SceneTransition();
        sceneTransition.init(document.querySelector(".game-container"), () => {
            this.map.overworld.startMap( window.OverworldMaps[this.event.map], {
                x: this.event.x,
                y: this.event.y,
                direction: this.event.direction,
            });
            resolve();

            sceneTransition.fadeOut();
        });
    }

    addStoryFlag(resolve) {
        window.playerState.storyFlags[this.event.flag] = true;
        resolve();
    }

    init() {
        return new Promise(resolve => {
            this[this.event.type](resolve);
        });
    }
}