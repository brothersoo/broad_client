import GameObject from "./GameObject.js";
import utils from "../utils/utils.js";

export default class Person extends GameObject {
    constructor(config) {
        super(config);
        this.movingProgressRemaining = 0;
        this.isStanding = false;

        this.isPlayerControlled = config.isPlayerControlled || false;

        this.directionUpdate = {
            "up": ["y", -1],
            "down": ["y", 1],
            "left": ["x", -1],
            "right": ["x", 1],
        }
    }

    getPublishData() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            direction: this.direction,
            sprite: {
                currentAnimation: this.sprite.currentAnimation,
                currentAnimationFrame: this.sprite.currentAnimationFrame,
                animationFrameProgress: this.sprite.animationFrameProgress
            },
            behaviorLoop: this.behaviorLoop,
            behaviorLoopIndex: this.behaviorLoopIndex,
            talking: this.talking,
            movingProgressRemaining: this.movingProgressRemaining,
            isStanding: this.isStanding,
        }
    }

    setSubscribedData(data) {
        this.x = data.x;
        this.y = data.y;
        this.direction = data.direction;
        this.sprite.currentAnimation = data.sprite.currentAnimation;
        this.sprite.currentAnimationFrame = data.sprite.currentAnimationFrame;
        this.sprite.animationFrameProgress = data.sprite.animationFrameProgress;
        this.behaviorLoop = data.behaviorLoop;
        this.behaviorLoopIndex = data.behaviorLoopIndex;
        this.talking = data.talking;
        this.movingProgressRemaining = data.movingProgressRemaining;
        this.isStanding = data.isStanding;
    }

    update(state) {
        if (this.movingProgressRemaining > 0) {
            this.updatePosition();
        } else {

            // More cases for starting to walk will come here
            //
            //

            // Case: We're keyboard-ready and have an arrow pressed
            if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
                this.startBehavior(state, {
                    type: "walk",
                    direction: state.arrow,
                });
                this.publishEvent(state.map.id, state.stompClient);
            }
            this.updateSprite(state);
        }
    }

    startBehavior(state, behavior) {
        // Set character direction to whatever behavior has
        this.direction = behavior.direction;

        if (behavior.type === "walk") {

            // Stop here if space is not free
            if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {

                behavior.retry && setTimeout(() => {
                    this.startBehavior(state, behavior);
                }, 10);

                return;
            }

            // Ready to walk
            state.map.moveWall(this.x, this.y, this.direction);
            this.movingProgressRemaining = 16;
            this.updateSprite(state);
        } else if (behavior.type === "stand") {
            this.standing = true;
            setTimeout(() => {
                utils.emitEvent("PersonStandComplete", {
                    whoId: this.id,
                });
                this.isStanding = false;
            }, behavior.time);
        }
    }

    updatePosition() {
        const [property, change] = this.directionUpdate[this.direction];
        this[property] += change;
        this.movingProgressRemaining -= 1;

        if (this.movingProgressRemaining === 0) {
            // We finished the walk!
            utils.emitEvent("PersonWalkingComplete", {
                whoId: this.id
            });
        }
    }

    updateSprite() {
        if (this.movingProgressRemaining > 0) {
            this.sprite.setAnimation("walk-" + this.direction);
            return;
        }
        this.sprite.setAnimation("idle-" + this.direction);
    }

    publishEvent(overworldId, stompClient) {
        console.log("publishing event start");

        console.log(JSON.stringify(this.getPublishData()));

        stompClient.send(`/app/action/${overworldId}`, {}, JSON.stringify(this.getPublishData()));

        console.log("publishing event finished");
    }
}