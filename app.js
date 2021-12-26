// Tetris rules
// https://tetris.fandom.com/wiki/Tetris_Guideline

window.addEventListener("DOMContentLoaded", initNewGame);

function initNewGame() {
    // definitions
    const tetrisCanvas = document.querySelector(".tetris-canvas");
    tetrisCanvas.height = 480;
    tetrisCanvas.width = 240;
    const ctx = tetrisCanvas.getContext("2d");
    const BLOCK_SIZE = 24;
    const blockArr = [];
    let fallTimerID;



    // classes
    class Block {
        constructor (x, y) {
            this.x = x;
            this.y = y;

            // ctx.rect(this.x, this.y, BLOCK_SIZE, BLOCK_SIZE);
            // ctx.stroke();
            // ctx.stroke();

            blockArr.push(this);

        }

        draw() {
            ctx.strokeStyle = "green";
            ctx.rect(this.x, this.y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.stroke();
        }

        moveDown() {
            this.y += BLOCK_SIZE;
        }
        shiftLeft() {

        }
        shiftRight() {

        }
        // softLock() {

        // }
        // hardLock() {

        // }
        // rotateCW() {

        // }
        // rotateCCW() {
            
        // }
    }


    // functions

    function fallBlocks() {
        console.log(ctx);

        ctx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
        // ctx.clearRect(0,0,tetrisCanvas.width, tetrisCanvas.height);
        blockArr[0].moveDown();
        blockArr[0].draw();

        console.log(blockArr[0].y);

        if (blockArr[0].y < 456) {
            setTimeout(() => {
                window.requestAnimationFrame(fallBlocks);
            }, 1000);
        }
    }

    // main

    new Block(0,-BLOCK_SIZE);

    fallBlocks();
}

//bottom is y = 456;