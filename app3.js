// Tetris rules
// https://tetris.fandom.com/wiki/Tetris_Guideline



window.addEventListener("DOMContentLoaded", initNewGame);

function initNewGame() {

    // definitions

    const tetrisCanvas = document.querySelector(".tetris-canvas");
    const GAME_HEIGHT = 480;
    const GAME_WIDTH = 240;
    tetrisCanvas.height = GAME_HEIGHT;
    tetrisCanvas.width = GAME_WIDTH;
    const ctx = tetrisCanvas.getContext("2d");
    const BLOCK_SIZE = GAME_WIDTH/10;
    let blockArr = [];
    let activeArr = []
    let fallTimerID;
    let gameTimerID;
    let blockGenerated = false;
    const normalSpeed = 1000;
    const rapidSpeed = 100;
    let fallSpeed = normalSpeed;   //time interval (ms) between downward block steps
    // let isArrowDown = false;
    let orgActiveArr = [];

    // classes

    class Block {
        constructor(x,y,state) {
        // constructor(x,y) {
            this.x = x;
            this.y = y;
            this.state = state;
        }
    }

    class I_Block {
        constructor () {
            this.state = {
                color: "cyan",
                type: "I",
                orientation: "horizontal"
            }

            for (let i=0; i<4; i++) {
                let xPos = 3*BLOCK_SIZE+i*BLOCK_SIZE;
                // activeArr.push(new Block(xPos,-BLOCK_SIZE,this.color));
                activeArr.push(new Block(xPos,-BLOCK_SIZE,this.state));
            }
        }
    }

    // functions

    function drawBlocks(array) {
        array.forEach(block => {
            ctx.fillStyle = block.state.color;
            ctx.fillRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
        });        
    }
    function moveDown () {
        const isBottom = activeArr.some(block => block.y+BLOCK_SIZE == GAME_HEIGHT);

        if (!isBottom && !detectCollision()) {
        // if (!isBottom) {
            activeArr.forEach(block => block.y += BLOCK_SIZE);
        } else {
            // console.log("Bottom!");
            generateNewBlock();
        }
    }
    function shiftRight() {
        const isRight = activeArr.some(block => block.x+BLOCK_SIZE == GAME_WIDTH);
        if (!isRight && !hasObstacle("right")) {
            activeArr.forEach(block => block.x += BLOCK_SIZE);
        }
    }
    function shiftLeft() {
        const isLeft = activeArr.some(block => block.x == 0);
        if (!isLeft && !hasObstacle("left")) {
            activeArr.forEach(block => block.x -= BLOCK_SIZE);
            
        }
    }

    function hasObstacle(side) {
        let isCollision = false;

        for (let i = 0; i<activeArr.length; i++) {
            const active = activeArr[i];
            for (let j = 0; j<blockArr.length; j++) {
                const passive = blockArr[j];
                if (side == "right") {
                    condition = active.x + BLOCK_SIZE == passive.x;
                } else {
                    condition = active.x == passive.x + BLOCK_SIZE;
                }
                if (!isCollision &&
                    condition &&
                    active.y == passive.y) {
                        isCollision = true;
                }
            }
        }

        return isCollision ? true : false;
    }
    
    function generateNewBlock() {
        activeArr.forEach(block => blockArr.push(block));
        activeArr = [];
        new I_Block();
        // console.log("Actives: "+activeArr.length/4+"; ", "Passives: "+blockArr.length/4);
    }

    function detectCollision() {
        let isCollision = false;

        for (let i = 0; i<activeArr.length; i++) {
            const active = activeArr[i];
            for (let j = 0; j<blockArr.length; j++) {
                const passive = blockArr[j];
                if (!isCollision &&
                    active.x < passive.x + BLOCK_SIZE &&
                    active.x + BLOCK_SIZE > passive.x &&
                    active.y <= passive.y + BLOCK_SIZE &&
                    active.y + BLOCK_SIZE >= passive.y) {
                        isCollision = true;
                    }
            }
        }

        return isCollision ? true : false;
    }

    function rotateBlock() {

        switch (activeArr[0].state.type) {
            case "I":
                rotateIBlock();
                break;
        }
    }

    function rotateIBlock() {
        let orientation = activeArr[0].state.orientation;
        const step = orientation == "horizontal"? BLOCK_SIZE : -BLOCK_SIZE;

        activeArr[0].x += step;
        activeArr[0].y += step;
        orientation = step > 0 ? "vertical" : "horizontal";
        for (let i=1; i<activeArr.length; i++) {
            if (step > 0) {
                activeArr[i].x = activeArr[0].x;
                activeArr[i].y = activeArr[0].y - i*BLOCK_SIZE;
                activeArr[i].state.orientation = "vertical";
            } else {
                activeArr[i].y = activeArr[0].y;
                activeArr[i].x = activeArr[0].x + i*BLOCK_SIZE;
                activeArr[i].state.orientation = "horizontal";
            }
        }
        // Check gamescreen limits and collisions
        const exceedsRight = activeArr.some(block => block.x+BLOCK_SIZE > GAME_WIDTH);
        const exceedsLeft = activeArr.some(block => block.x < 0);
        const exceedsBottom = activeArr.some(block => block.y+BLOCK_SIZE > GAME_HEIGHT);
        if (detectCollision() || exceedsLeft || exceedsRight || exceedsBottom) {
            rotateIBlock();
        }
    }

    function gameLoop() {
        ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
        drawBlocks(activeArr);
        drawBlocks(blockArr);
        requestAnimationFrame(gameLoop);
    }

    // function changeSpeed () {
    //     fallSpeed = fallSpeed == normalSpeed ? rapidSpeed : normalSpeed;
    //     clearInterval(fallTimerID);
    //     fallTimerID = setInterval(() => {
    //         console.log(fallSpeed);
    //         moveDown();
    //     }, fallSpeed);
    // }

    // function rapidKeyDown(event) {
    //     if (event.key == "ArrowDown") {
    //         console.log("arrow key - down");
    //         changeSpeed();
    //         document.addEventListener("keyup", (e) => {
    //             rapidKeyUp(e);
    //         });
    //     }
    // }
    // function rapidKeyUp(event) {
    //     if (event.key == "ArrowDown") {
    //         console.log("arrow key - up");
    //         changeSpeed();
    //         document.addEventListener("keydown", (e) => {
    //             rapidKeyDown(e);
    //         });
    //     }
    // }

    
    // game

    tetrisCanvas.addEventListener("click", () => {
        generateNewBlock();
        fallTimerID = setInterval(() => moveDown(), fallSpeed);

    }, {once: true});
    // tetrisCanvas.addEventListener("click", () => {
    //     generateNewBlock();
    //     fallTimerID = setInterval(() => {
    //         // console.log(fallSpeed);
    //         if (!detectCollision()) {
    //             console.log("not moved");
    //             moveDown();
    //             alert("moved");
    //         } else {
    //             console.log("Collision!");
    //             generateNewBlock();
    //         }
    //         // moveDown();
    //     }, fallSpeed);

    // }, {once: true});

    // fallTimerID = setInterval(() => moveDown(), fallSpeed);

    gameLoop();

    document.addEventListener("keyup", (event) => {

        switch (event.key) {
            case "ArrowRight":
                shiftRight();
                break;
            case "ArrowLeft":
                shiftLeft();
                break;
            case "ArrowUp":
                rotateBlock();
                break;
        }

    //     if (event.key == "ArrowRight") {
    //         shiftRight();
    //     }
    // });
    // document.addEventListener("keyup", (event) => {
    //     if (event.key == "ArrowLeft") {
    //         shiftLeft();
    //     }
    });

    // document.addEventListener("keydown", (event) => {
    //     console.log("arrow key - down - FIRST");
    //     rapidKeyDown(event);
    // });

    // document.addEventListener("keydown", (event) => {
    //     // alert("keydown: "+event.key);
    //     if (event.key == "ArrowDown") {
    //         changeSpeed();
    //         document.addEventListener("keyup", (event) => {
    //             // alert("keydown: "+event.key);
    //             if (event.key == "ArrowDown") {
    //             changeSpeed();
            
    //     }
    // }, {once:true});
}