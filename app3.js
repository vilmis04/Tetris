// Tetris rules
// https://tetris.fandom.com/wiki/Tetris_Guideline
// https://www.colinfahey.com/tetris/tetris.html



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
    const BLOCK_COUNT = GAME_WIDTH/BLOCK_SIZE; // number of blocks in layer
    let blockArr = [];
    let activeArr = []
    let fallTimerID;
    // let gameTimerID;
    // let blockGenerated = false;
    const normalSpeed = 500;
    const softDrop = 25;
    let fallSpeed = normalSpeed;   //time interval (ms) between downward block steps
    let isArrowDown = false;
    let isGameOver = false;
    let layerCounter = [];

    for (let i=0; i<GAME_HEIGHT/BLOCK_SIZE; i++) {
        layerCounter.push([i*BLOCK_SIZE, 0]);
        // [layer_height, block_count (initially 0)]
    }

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
                stroke: "blue",
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

    class O_Block {
        constructor () {
            this.state = {
                color: "yellow",
                stroke: "orange",
                type: "O",
                orientation: ""
            }           
            activeArr.push(new Block(4*BLOCK_SIZE,-2*BLOCK_SIZE,this.state));
            activeArr.push(new Block(5*BLOCK_SIZE,-2*BLOCK_SIZE,this.state));
            activeArr.push(new Block(4*BLOCK_SIZE,-BLOCK_SIZE,this.state));
            activeArr.push(new Block(5*BLOCK_SIZE,-BLOCK_SIZE,this.state));
        }
    }

    // functions

    function drawBlocks(array) {
        array.forEach(block => {
            ctx.fillStyle = block.state.color;
            ctx.strokeStyle = block.state.stroke;
            ctx.beginPath();
            // ctx.fillRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.rect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.fill();
            ctx.stroke();

        });        
    }
    function moveDown () {
        const isBottom = activeArr.some(block => block.y+BLOCK_SIZE == GAME_HEIGHT);
 
        if (!isBottom && !detectCollision() && !isGameOver) {
        // if (!isBottom) {
            activeArr.forEach(block => block.y += BLOCK_SIZE);
        } else {
            // console.log("Bottom!");
            generateNewBlock();
        }
    }
    function shiftRight() {
        const isRight = activeArr.some(block => block.x+BLOCK_SIZE == GAME_WIDTH);
        if (!isGameOver && !isRight && !hasObstacle("right")) {
            activeArr.forEach(block => block.x += BLOCK_SIZE);
        }
    }
    function shiftLeft() {
        const isLeft = activeArr.some(block => block.x == 0);
        if (!isGameOver && !isLeft && !hasObstacle("left")) {
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
        if (!isGameOver) {
            activeArr.forEach(block => blockArr.push(block));
            activeArr = [];
            // --> check if any layer is full
            detectFullLayer();
            new O_Block();
            // console.log("Actives: "+activeArr.length/4+"; ", "Passives: "+blockArr.length/4);
        }
    }

    function detectFullLayer() {
        layerCounter.forEach(layer => {
            let blockCount = blockArr.filter(block => block.y == layer[0]);
            layer[1] = blockCount.length;
            if (blockCount.length == 10) {
                deleteFullLayer(layer[0]);
            }
        });
    }

    function deleteFullLayer(height) {
        for (let i=0; i<blockArr.length; i++) {
            if (blockArr[i].y == height) {
                blockArr.splice(i,1);
                i--;
            }
        }

        fallBlocksAboveDeletedLayer(height);
    }

    function fallBlocksAboveDeletedLayer(height) {
        for (let i=0; i<blockArr.length; i++) {
            if (blockArr[i].y < height) {
                blockArr[i].y += BLOCK_SIZE;
            }
        }
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

        const exceedsTop = activeArr.some(block => block.y < 0);
        if (isCollision && exceedsTop) {
            gameOver();
        }
        return isCollision;
    }

    function rotateBlock() {

        if (!isGameOver) {
            switch (activeArr[0].state.type) {
                case "I":
                    rotateIBlock();
                    break;
            }
        }
    }

    function gameOver() {
        console.log("Game Over");
        isGameOver = true;
        clearInterval(fallTimerID);
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

    function changeSpeed () {
        fallSpeed = fallSpeed == normalSpeed ? softDrop : normalSpeed;
        clearInterval(fallTimerID);
        fallTimerID = setInterval(() => moveDown(), fallSpeed);
    }
   
    // game

    tetrisCanvas.addEventListener("click", () => {
        generateNewBlock();
        fallTimerID = setInterval(() => moveDown(), fallSpeed);
    }, {once: true});

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
            case "ArrowDown":
                // console.log("Slow down!");
                changeSpeed();
                isArrowDown = false;
                break;
        }
    });

    document.addEventListener("keydown", (event) => {

        switch (event.key) {
            case "ArrowDown":
                if (!isArrowDown) {
                    // console.log("Speed up!");
                    changeSpeed();
                    isArrowDown = true;
                }
                break;
        }
    });
}