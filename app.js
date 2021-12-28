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
    
            // blockArr.push(this);
    
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

    // functions

    function drawBlock() {
        // console.log("x: "+event.x,"y: "+event.y);
        // console.log("cx: "+(event.x-200),"cy: "+(event.y-449));
        const blockPos = blockArr[0].position;
        // const block = blockArr[0];
        // block.moveDown();
        ctx.fillStyle = "green";
        ctx.fillRect(blockPos.x, blockPos.y, BLOCK_SIZE, BLOCK_SIZE);
        // ctx.stroke();
    }

    // function gameLoop() {
    //     ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
    //     setTimeout(drawBlock,1000);
    //     requestAnimationFrame(gameLoop);
    // }
    function gameLoop() {
        ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
        drawBlock();
        requestAnimationFrame(gameLoop);
    }
    
    // function gameLoop() {
    //     ctx.clearRect(0, 0, GAME_HEIGHT, GAME_WIDTH);
    //     blockArr[0].moveDown();
    //     blockArr[0].draw();
    // }

    // game



    // new Block(0,-BLOCK_SIZE);
    // new Block(100,100);

    // ctx.clearRect(0, 0, GAME_HEIGHT, GAME_WIDTH);
    // blockArr[0].moveDown();
    // blockArr[0].draw();
    
    // requestAnimationFrame(gameLoop);


    // tetrisCanvas.addEventListener("click", (event) => {
    //     console.log("click!");
    //     mouse.x = event.x-200;
    //     mouse.y = event.y -449;
    //     // drawBlock();
    // });
    // tetrisCanvas.addEventListener("mousemove", (event) => {
    //     console.log("click!");
    //     mouse.x = event.x-200;
    //     mouse.y = event.y-449;
    //     // drawBlock();
    // });

    blockArr.push(new Block(0,-BLOCK_SIZE));

    // gameTimerID = setInterval(gameLoop, 1000);
    gameTimerID = setInterval(() => {
        blockArr[0].moveDown();
    }, 1000);
    gameLoop();

    document.addEventListener("keyup", (event) => {
        if (event.keyCode == "39") {
            blockArr[0].shiftRight();
        }
    });
    document.addEventListener("keyup", (event) => {
        if (event.keyCode == "37") {
            blockArr[0].shiftLeft();
        }
    });
}
//bottom is y = 456;