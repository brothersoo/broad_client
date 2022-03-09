import utils from "../utils/utils.js"

const MapConfig = {
    GreenRoom: {
        // id: "GreenRoom",
        lowerSrc: "/images/maps/green_room.png",
        upperSrc: "",
        gameObjects: {
            // player: new Person({
            //     isPlayerControlled: true,
            //     x: utils.withGrid(5),
            //     y: utils.withGrid(6),
            // }),
        },
        walls: {
            //upper
            [utils.asGridCoord(1,0)] : true,
            [utils.asGridCoord(2,0)] : true,
            [utils.asGridCoord(3,0)] : true,
            [utils.asGridCoord(4,0)] : true,
            [utils.asGridCoord(5,0)] : true,
            [utils.asGridCoord(6,0)] : true,
            [utils.asGridCoord(7,0)] : true,
            [utils.asGridCoord(8,0)] : true,
            [utils.asGridCoord(9,0)] : true,
            [utils.asGridCoord(10,0)] : true,

            // left
            [utils.asGridCoord(11,1)] : true,
            [utils.asGridCoord(11,2)] : true,
            [utils.asGridCoord(11,3)] : true,
            [utils.asGridCoord(11,4)] : true,
            [utils.asGridCoord(11,5)] : true,
            [utils.asGridCoord(11,6)] : true,
            [utils.asGridCoord(11,7)] : true,
            [utils.asGridCoord(11,8)] : true,
            [utils.asGridCoord(11,9)] : true,
            [utils.asGridCoord(11,10)] : true,

            //down
            [utils.asGridCoord(1,11)] : true,
            [utils.asGridCoord(2,11)] : true,
            [utils.asGridCoord(3,11)] : true,
            [utils.asGridCoord(4,11)] : true,
            [utils.asGridCoord(5,11)] : true,
            [utils.asGridCoord(6,11)] : true,
            [utils.asGridCoord(7,11)] : true,
            [utils.asGridCoord(8,11)] : true,
            [utils.asGridCoord(9,11)] : true,
            [utils.asGridCoord(10,11)] : true,

            // left
            [utils.asGridCoord(0,1)] : true,
            [utils.asGridCoord(0,2)] : true,
            [utils.asGridCoord(0,3)] : true,
            [utils.asGridCoord(0,4)] : true,
            [utils.asGridCoord(0,5)] : true,
            [utils.asGridCoord(0,6)] : true,
            [utils.asGridCoord(0,7)] : true,
            [utils.asGridCoord(0,8)] : true,
            [utils.asGridCoord(0,9)] : true,
            [utils.asGridCoord(0,10)] : true,
        }
    }
}

export default MapConfig;