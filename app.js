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
    let fallTimerID;
    let gameTimerID;

    // classes

    class Block {
        constructor (posX, posY, collLimit) {
            this.collLimit = collLimit;
            this.position = {
                x: posX,
                y: posY
            }
        }
    
        draw() {
            ctx.strokeStyle = "green";
            ctx.rect(this.position.x, this.position.y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.stroke();
        }
        moveDown() {
            if (this.position.y < GAME_HEIGHT-BLOCK_SIZE) {
                this.position.y += BLOCK_SIZE;
            }
        }
        shiftRight() {
            if (this.position.x < GAME_WIDTH-BLOCK_SIZE) {
                this.position.x += BLOCK_SIZE;
            }
        }
        shiftLeft() {
            if (this.position.x > 0) {
                this.position.x -= BLOCK_SIZE;
            }
        }
    }

    class I_Block {
        constructor () {
            this.color = "cyan";
            let collLimit = 0;
            ctx.fillStyle = this.color;
            for (let i=0; i<4; i++) {
                if (i == 0 || i == 3) {
                    collLimit = 1;
                } else {
                    collLimit = 2;
                }
                let xPos = 3*BLOCK_SIZE+i*BLOCK_SIZE;
                blockArr.push(new Block(xPos,-BLOCK_SIZE,collLimit));
            }
        }
    }

    // functions

    function drawBlock() {
        blockArr.forEach(block => {
            blockPos = block.position;
            ctx.fillStyle = block.color;
            ctx.fillRect(blockPos.x, blockPos.y, BLOCK_SIZE, BLOCK_SIZE);
        });
    }

    function detectCollision(block) {
        // const activeBlock = {
        //     x: block.position.x,
        //     y: block.position.y
        // }
        const active = block.position;

        let collArr = blockArr.filter(item => {
            let itemPos = item.position;
            if (active.x <= itemPos.x + BLOCK_SIZE &&
                active.x + BLOCK_SIZE >= itemPos.x &&
                active.y <= itemPos.y + BLOCK_SIZE &&
                active.y + BLOCK_SIZE >= itemPos.y) {
                    return true;
                }
        });

        console.log("Collision no.: "+collArr.length-1);
        // alert("Collision no.: "+collArr.length);

        if (collArr.length-1 > block.collLimit) {
            // alert("Collision detected!");
            console.log("Collision detected! ");
            return true;
        } else {
            return false;
        }
    }

    function gameLoop() {
        ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
        activeTetrimino = blockArr.slice(-4);
        drawBlock();
        requestAnimationFrame(gameLoop);
    }
    
    // game

    // blockArr.push(new Block(0,-BLOCK_SIZE));
    // blockArr.push(new Block(BLOCK_SIZE,-BLOCK_SIZE));
    // blockArr.push(new Block(2*BLOCK_SIZE,-BLOCK_SIZE));
    // blockArr.push(new Block(3*BLOCK_SIZE,-BLOCK_SIZE));
    new I_Block;
    setTimeout(() => {
        new I_Block;
    }, 21000);

    fallTimerID = setInterval(() => {
        let activeTetrimino = blockArr.slice(-4);
        activeTetrimino.forEach(block => {
            if (detectCollision(block)) {
                new I_Block;
            }
            block.moveDown();
        });
    }, 1000);
    gameLoop();

    document.addEventListener("keyup", (event) => {
        if (event.key == "ArrowRight") {
            let activeTetrimino = blockArr.slice(-4);
            activeTetrimino.forEach(block => {
                block.shiftRight();
            });
        }
    });
    document.addEventListener("keyup", (event) => {
        if (event.key == "ArrowLeft") {
            let activeTetrimino = blockArr.slice(-4);
            activeTetrimino.forEach(block => {
                block.shiftLeft();
            });
        }
    });
}