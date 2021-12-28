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
        constructor() {}
        moveDown() {
            if (this.y < GAME_HEIGHT-BLOCK_SIZE) {
                this.y += BLOCK_SIZE;
            } else {
                blockArr.push(new I_Block());
            }
        }
        shiftRight() {
            if (this.x < GAME_WIDTH-this.width) {
                this.x += BLOCK_SIZE;
            }
        }
        shiftLeft() {
            if (this.x > 0) {
                this.x -= BLOCK_SIZE;
            }
        }
    }

    class I_Block extends Block {
        constructor() {
            super();
            this.x = 3*BLOCK_SIZE;
            this.y = -BLOCK_SIZE;
            this.width = 4*BLOCK_SIZE;
            this.height = BLOCK_SIZE;
            this.color = "cyan";
        }
        draw () {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        detectCollision () {
            // if () {}
        }

    }

    // functions

    function drawBlock() {
        blockArr.forEach(block => {
            block.draw();
        });
    }

    // function detectCollision(block) {
    //     let activeTetrimino = blockArr[blockArr.length-1];


        // const activeBlock = {
        //     x: block.position.x,
        //     y: block.position.y
        // }

        // const active = block.position;

        // let collArr = blockArr.filter(item => {
        //     let itemPos = item.position;
        //     if (active.x <= itemPos.x + BLOCK_SIZE &&
        //         active.x + BLOCK_SIZE >= itemPos.x &&
        //         active.y <= itemPos.y + BLOCK_SIZE &&
        //         active.y + BLOCK_SIZE >= itemPos.y) {
        //             return true;
        //         }
        // });

        // console.log("Collision no.: "+collArr.length-1);
        // alert("Collision no.: "+collArr.length);

        // if (collArr.length-1 > block.collLimit) {
        //     // alert("Collision detected!");
        //     console.log("Collision detected! ");
        //     return true;
        // } else {
        //     return false;
        // }
    // }

    function gameLoop() {
        ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
        drawBlock();
        requestAnimationFrame(gameLoop);
    }
    
    // game

    tetrisCanvas.addEventListener("click", () => {
        blockArr.push(new I_Block());
    }, {once: true});

    fallTimerID = setInterval(() => {
        let activeTetrimino = blockArr.slice(-1);
        activeTetrimino.forEach(block => {
            // if (detectCollision(block)) {
            //     new I_Block;
            // }
            block.moveDown();
        });
    }, 1000);
    gameLoop();

    document.addEventListener("keyup", (event) => {
        if (event.key == "ArrowRight") {
            let activeTetrimino = blockArr.slice(-1);
            activeTetrimino[0].shiftRight();
        }
    });
    document.addEventListener("keyup", (event) => {
        if (event.key == "ArrowLeft") {
            let activeTetrimino = blockArr.slice(-1);
            activeTetrimino[0].shiftLeft();
        }
    });
}