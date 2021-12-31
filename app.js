// Tetris rules
// https://tetris.fandom.com/wiki/Tetris_Guideline
// https://www.colinfahey.com/tetris/tetris.html

/* Bugs:
Solved? | Description
----------------------------------------------
  [ ]   | Can rotate on another block and then stops
  [x]   | Stroke lines overlap (visual issue)
  [x]   | Start speed should be normal speed (despite ArrowDown)
  [x]   | randomizeBlock should be changed to generate all pieces for two "bags"


  Roadmap:

Done? | Description
----------------------------------------------
  [x]   | Main panel styling
  [ ]   | Next block display
  [ ]   | Scoring
  [ ]   | Local storage of highscores
  [ ]   | LeaderBoard
  [x]   | Play button
  [ ]   | Pause button
  [x]   | Reset button
  [x]   | Countdown before start
  [ ]   | Countdown after pause
  [ ]   | Mobile controls


*/
window.addEventListener("DOMContentLoaded", initNewGame);

function initNewGame() {

    // definitions

    const tetrisCanvas = document.querySelector(".tetris-canvas");
    const playBtn = document.querySelector("#play-btn");
    const resetBtn = document.querySelector("#reset-btn");
    const ldrbrdBtn = document.querySelector("#ldrbrd-btn");
    const GAME_HEIGHT = 480;
    const GAME_WIDTH = 240;
    tetrisCanvas.height = GAME_HEIGHT;
    tetrisCanvas.width = GAME_WIDTH;
    const ctx = tetrisCanvas.getContext("2d");
    const BLOCK_SIZE = GAME_WIDTH/10;
    const BLOCK_COUNT = GAME_WIDTH/BLOCK_SIZE; // number of blocks in layer
    let blockArr = [];
    let activeArr = [];
	let orderArr = [];
    let fallTimerID;
    // let gameTimerID;
    // let blockGenerated = false;
    const normalSpeed = 500;
    const softDrop = 25;
    const hardDrop = 1;
    let fallSpeed = normalSpeed;   //time interval (ms) between downward block steps
    let isArrowDown = false;
    let ishardDrop = false;
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
                stroke: "hsl(180, 10%, 10%)",
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
                stroke: "hsl(60, 10%, 10%)",
                type: "O",
                orientation: ""
            }           
            activeArr.push(new Block(4*BLOCK_SIZE,-2*BLOCK_SIZE,this.state));
            activeArr.push(new Block(5*BLOCK_SIZE,-2*BLOCK_SIZE,this.state));
            activeArr.push(new Block(4*BLOCK_SIZE,-BLOCK_SIZE,this.state));
            activeArr.push(new Block(5*BLOCK_SIZE,-BLOCK_SIZE,this.state));
        }
    }

    class S_Block {
        constructor () {
            this.state = {
                color: "green",
                stroke: "hsl(120, 10%, 10%)",
                type: "S",
                orientation: "horizontal"
            }           
            activeArr.push(new Block(4*BLOCK_SIZE,-2*BLOCK_SIZE,this.state));
            activeArr.push(new Block(5*BLOCK_SIZE,-2*BLOCK_SIZE,this.state));
            activeArr.push(new Block(3*BLOCK_SIZE,-BLOCK_SIZE,this.state));
            activeArr.push(new Block(4*BLOCK_SIZE,-BLOCK_SIZE,this.state));
        }
    }

    class Z_Block {
        constructor () {
            this.state = {
                color: "red",
                stroke: "hsl(0, 10%, 10%)",
                type: "Z",
                orientation: "horizontal"
            }           
            activeArr.push(new Block(4*BLOCK_SIZE,-2*BLOCK_SIZE,this.state));
            activeArr.push(new Block(4*BLOCK_SIZE,-BLOCK_SIZE,this.state));
            activeArr.push(new Block(3*BLOCK_SIZE,-2*BLOCK_SIZE,this.state));
            activeArr.push(new Block(5*BLOCK_SIZE,-BLOCK_SIZE,this.state));
        }
    }

    class L_Block {
        constructor () {
            this.state = {
                color: "orange",
                stroke: "hsl(39, 10%, 10%)",
                type: "L",
                orientation: 0
            }           
            activeArr.push(new Block(4*BLOCK_SIZE,-BLOCK_SIZE,this.state));
            activeArr.push(new Block(5*BLOCK_SIZE,-2*BLOCK_SIZE,this.state));
            activeArr.push(new Block(3*BLOCK_SIZE,-BLOCK_SIZE,this.state));
            activeArr.push(new Block(5*BLOCK_SIZE,-BLOCK_SIZE,this.state));
        }
    }

    class J_Block {
        constructor () {
            this.state = {
                color: "blue",
                stroke: "hsl(240, 10%, 10%)",
                type: "J",
                orientation: 0
            }           
            activeArr.push(new Block(4*BLOCK_SIZE,-BLOCK_SIZE,this.state));
            activeArr.push(new Block(3*BLOCK_SIZE,-2*BLOCK_SIZE,this.state));
            activeArr.push(new Block(3*BLOCK_SIZE,-BLOCK_SIZE,this.state));
            activeArr.push(new Block(5*BLOCK_SIZE,-BLOCK_SIZE,this.state));
        }
    }

    class T_Block {
        constructor () {
            this.state = {
                color: "purple",
                stroke: "hsl(300, 10%, 10%)",
                type: "T",
                orientation: 0
            }           
            activeArr.push(new Block(4*BLOCK_SIZE,-BLOCK_SIZE,this.state));
            activeArr.push(new Block(4*BLOCK_SIZE,-2*BLOCK_SIZE,this.state));
            activeArr.push(new Block(3*BLOCK_SIZE,-BLOCK_SIZE,this.state));
            activeArr.push(new Block(5*BLOCK_SIZE,-BLOCK_SIZE,this.state));
        }
    }

    // functions

    function drawBlocks(array) {
        array.forEach(block => {
            ctx.fillStyle = block.state.color;
            ctx.strokeStyle = block.state.stroke;
            ctx.fillRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.beginPath();
            // ctx.fillRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.rect(block.x+1, block.y+1, BLOCK_SIZE-2, BLOCK_SIZE-2);
            // ctx.fill();
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
            changeSpeed(normalSpeed);
            selectBlock();
            // new O_Block();
            // console.log("Actives: "+activeArr.length/4+"; ", "Passives: "+blockArr.length/4);
        }
    }

    function selectBlock() {
		let number = orderArr.shift();
		let randomArr = generateRandomOrder();
		// console.log(orderArr.length);
		if (orderArr.length < 9) {
			orderArr = orderArr.concat(randomArr);
		}
		// console.log("af: "+orderArr.length);

        switch (number) {
            case 1:
                new I_Block;
                break;
            case 2:
                new O_Block;
                break;
            case 3:
                new S_Block;
				break;
            case 4:
                new Z_Block;
				break;
            case 5:
                new L_Block;
				break;
            case 6:
                new J_Block;
				break;
            case 7:
                new T_Block;
				break;
        }
    }

	// function randomizeBlock() {
	// 	if (orderArr.length <= 9) {
	// 		orderArr.concat(generateRandomOrder());
	// 	}
	// 	return orderArr.shift();
	// }

	function generateRandomOrder() {
		let arr = [];
		while (arr.length<7) {
			let num = Math.round(Math.random()*6+1);
			if (arr.indexOf(num) == -1) {
				arr.push(num)
			}
		}
		return arr;
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
                    active.y < passive.y + BLOCK_SIZE &&
                    active.y + BLOCK_SIZE >= passive.y) {
                        isCollision = true;
                    }
            }
        }

        const exceedsTop = activeArr.some(block => block.y == -BLOCK_SIZE);
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
                case "S":
                    rotateSZBlock();
                    break;
                case "Z":
                    rotateSZBlock();
                    break;
                case "J":
                    rotateJLTBlock();
                    break;
                case "L":
                    rotateJLTBlock();
                    break;
                case "T":
                    rotateJLTBlock();
                    break;
            }
        }
    }

	function rotateJLTBlock() {
		let orient = activeArr[0].state.orientation;
		const type = activeArr[0].state.type;
		const dir1 = orient==0 || orient==3 ? -BLOCK_SIZE : BLOCK_SIZE;
		const dir2 = orient==0 || orient==1 ? BLOCK_SIZE : -BLOCK_SIZE;
		let axis = "";
		
		switch (type) {
			case "L":
				axis = orient % 2 == 0 ? "x" : "y";
				activeArr[1][axis] += 2*dir1;
				break;
			case "J":
				axis = orient % 2 == 1 ? "x" : "y";
				activeArr[1][axis] += 2*dir2;
				break;
			case "T":
				activeArr[1].x += dir1;
				activeArr[1].y += dir2;
				break;
		}

		activeArr[2].x += dir2;
		activeArr[2].y += -dir1;

		activeArr[3].x += -dir2;
		activeArr[3].y += dir1;

		activeArr[0].state.orientation = orient == 3? 0 : ++orient;

		checkRotation(rotateJLTBlock);
	}

    function rotateSZBlock() {
        let orientation = activeArr[0].state.orientation;
        const direction = orientation=="horizontal"?2*BLOCK_SIZE:-2*BLOCK_SIZE;
          
		activeArr[2].x = activeArr[2].x+direction;
		activeArr[3].y = activeArr[3].y-direction;
		activeArr[0].state.orientation = orientation == "horizontal" ? "vertical" : "horizontal";
        
		checkRotation(rotateSZBlock);
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
        checkRotation(rotateIBlock);
    }

    function checkRotation(callback) {
        const exceedsRight = activeArr.some(block => block.x+BLOCK_SIZE > GAME_WIDTH);
        const exceedsLeft = activeArr.some(block => block.x < 0);
        const exceedsBottom = activeArr.some(block => block.y+BLOCK_SIZE > GAME_HEIGHT);
        if (detectCollision() || exceedsLeft || exceedsRight || exceedsBottom) {
            // if (detectCollision()) {
            //     activeArr.forEach(block => block.y -= BLOCK_SIZE);
            // }
            callback();
        }
    }
    
    function gameOver() {
        console.log("Game Over");
        isGameOver = true;
        clearInterval(fallTimerID);
    }

    function gameLoop() {
        ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
        drawBlocks(activeArr);
        drawBlocks(blockArr);
        requestAnimationFrame(gameLoop);
    }

    function changeSpeed (speed) {
        // fallSpeed = fallSpeed == normalSpeed ? softDrop : normalSpeed;
        if (!isGameOver) {
            clearInterval(fallTimerID);
            fallTimerID = setInterval(() => moveDown(), speed);
        }
    }

    function startCountdown() {
        let remainingTime = 3;
        const timer = document.createElement("div");
        timer.style.fontSize = "3rem";
        timer.style.color = "white";
        timer.style.zIndex = "999";
        timer.style.position = "absolute";
        timer.style.left = "37.5%";
        timer.style.top = "40%";
        grid.append(timer);
        
        timer.textContent = remainingTime;
        setTimeout(()=>{
            timer.textContent = --remainingTime;
        },1000);
        setTimeout(()=>{
            timer.textContent = --remainingTime;
        },2000);
        setTimeout(()=>{
            timer.remove();
        },3000);

    }
   
    // game

    playBtn.addEventListener("click", () => {
        startCountdown();
        // orderArr = generateRandomOrder().concat(generateRandomOrder());
        // generateNewBlock();
        // changeSpeed(normalSpeed);
        setTimeout(() => {
            orderArr = generateRandomOrder().concat(generateRandomOrder());
            generateNewBlock();
            changeSpeed(normalSpeed);
        }, 3000);

		
    }, {once: true});

    resetBtn.addEventListener("click", () => {
        clearInterval(fallTimerID);
        initNewGame();
        playBtn.textContent = "PLAY";
    });

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
                changeSpeed(normalSpeed);
                isArrowDown = false;
                break;
            case " ":
                changeSpeed(hardDrop);
                // ishardDrop = false;
        }
    });

    document.addEventListener("keydown", (event) => {

        switch (event.key) {
            case "ArrowDown":
                if (!isArrowDown) {
                    // console.log("Speed up!");
                    changeSpeed(softDrop);
                    isArrowDown = true;
                }
                break;
        }
    });
}