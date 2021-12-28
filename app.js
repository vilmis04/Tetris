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

    const mouse = {
        x: undefined,
        y: undefined
    }


    // classes
    class Block {
        constructor (posX, posY) {
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
            ctx.fillStyle = this.color;
            for (let i=0; i<4; i++) {
                let xPos = 3*BLOCK_SIZE+i*BLOCK_SIZE;
                blockArr.push(new Block(xPos,-BLOCK_SIZE));
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

    function detectCollision() {
        
    }

    function gameLoop() {
        ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
        drawBlock();
        requestAnimationFrame(gameLoop);
    }
    
    // game

    // blockArr.push(new Block(0,-BLOCK_SIZE));
    // blockArr.push(new Block(BLOCK_SIZE,-BLOCK_SIZE));
    // blockArr.push(new Block(2*BLOCK_SIZE,-BLOCK_SIZE));
    // blockArr.push(new Block(3*BLOCK_SIZE,-BLOCK_SIZE));
    new I_Block;
    // setTimeout(() => {
    //     new I_Block;
    // }, 21000);

    gameTimerID = setInterval(() => {
        blockArr.slice(-4).forEach(block => block.moveDown());
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