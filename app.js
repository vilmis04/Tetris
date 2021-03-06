// Tetris rules
// https://tetris.fandom.com/wiki/Tetris_Guideline
// https://www.colinfahey.com/tetris/tetris.html

/* Bugs:
Solved? | Description
----------------------------------------------
  [x]   | Can rotate on another block and then stops
  [x]   | Stroke lines overlap (visual issue)
  [x]   | Start speed should be normal speed (despite ArrowDown)
  [x]   | randomizeBlock should be changed to generate all pieces for two "bags"
  [x]   | text (game over/ start/ timer) positioning
  [x]   | Next block positioning in display box
  [x]   | reset button not reseting properly
  [x]   | pause/play not functioning properly
  [x]   | leaderboard doesn't open if no local storage entry exists
  [x]   | multiple instances of leaderboard can be opnened


  Roadmap:

Done? | Description
----------------------------------------------
  [x]   | Main panel styling
  [x]   | Play button
  [x]   | Pause button
  [x]   | Reset button
  [x]   | Countdown before start
  [x]   | Countdown after pause
  [x]   | Game Over screen
  [x]   | Next block display
  [x]   | Leveling
  [x]   | Scoring (clearing lines only)
  [x]   | Local storage of highscores (prompt for name entry)
  [x]   | LeaderBoard
  [x]   | LeaderBoard style updates
  [x]   | Mobile controls
  [x]   | grid display
  [x]   | Button layout / gameflow
  [x]   | move right on hold
  [ ]   | Scoring for soft drop
  [ ]   | Scoring for hard drop


*/
window.addEventListener("DOMContentLoaded", initNewGame);

function initNewGame() {

    // definitions

    const grid = document.querySelector("#grid");
    const mobileControls = document.querySelector(".mobile-controls");
    const tetrisCanvas = document.querySelector(".tetris-canvas");
    const nextCanvas = document.querySelector(".next-canvas");
    const levelCanvas = document.querySelector("#level-progress");
    const gridCanvas = document.querySelector("#grid-canvas");
    const ltx = levelCanvas.getContext("2d");
    const ntx = nextCanvas.getContext("2d");
    const gtx = gridCanvas.getContext("2d");
    levelCanvas.height = 60;
    levelCanvas.width = 60;
    nextCanvas.width = 120;
    nextCanvas.height = 72;
    const playBtn = document.querySelector("#play-btn");
    const resetBtn = document.querySelector("#reset-btn");
    const ldrbrdBtn = document.querySelector("#ldrbrd-btn");
    const gameOverText = document.createElement("div");
    const GAME_HEIGHT = 480;
    const GAME_WIDTH = 240;
    tetrisCanvas.height = GAME_HEIGHT;
    tetrisCanvas.width = GAME_WIDTH;
    gridCanvas.height = tetrisCanvas.height;
    gridCanvas.width = tetrisCanvas.width;
    const ctx = tetrisCanvas.getContext("2d");
    const BLOCK_SIZE = GAME_WIDTH/10;
    let blockArr = [];
    let activeArr = [];
	let orderArr = [];
    let nextShape = [];

    let fallTimerID;
    let levelCount = 0;
    let level = 1;
    let normalSpeed = 500 - ((level-1)*50);
    let softDrop = 25 - ((level-1)*3);
    const hardDrop = 1;
    let isArrowDown = false;
    let isGameOver = false;
    let layerCounter = [];
    let linesToClear = 10;
    let score = 0;
    let deleteCounter = 0;
    const scoreOnScreen = document.querySelector(".score-number");
    const highscoreOnScreen = document.querySelector(".best-number");
    const storage = window.localStorage;
    let highscore = storage.getItem("TetrisHighscore");
    highscore = highscore ? highscore : 0;
    const onScreenLeadboard = document.createElement("div");
    const namePrompt = document.createElement("div");
    let isLeaderboardOpen = false;
    let isLeaderboardCreated = false;

    const leftBtn = document.querySelector(".left");
    const rightBtn = document.querySelector(".right");
    const rotateBtn = document.querySelector(".rotate");
    const softBtn = document.querySelector(".soft-drop");
    const hardBtn = document.querySelector(".hard-drop");

    let moveTimerID;

    scoreOnScreen.textContent = score;
    highscoreOnScreen.textContent = highscore;

    if (!storage.getItem("TetrisLeaderboard")) {
        storage.setItem("TetrisLeaderboard",JSON.stringify([]));
    }

    for (let i=0; i<GAME_HEIGHT/BLOCK_SIZE; i++) {
        layerCounter.push([i*BLOCK_SIZE, 0]);
    }

    // classes

    class Block {
        constructor(x,y,state) {
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

    function drawLevelGraphics() {
        let endPoint = levelCount/linesToClear * 2;
        endPoint = level == 10? 2 : endPoint;

        ltx.strokeStyle = "green";
        ltx.lineWidth = 8;
        ltx.clearRect(0,0,60,60);
        ltx.beginPath();
        ltx.arc(30,30,24,0,endPoint*Math.PI);
        ltx.stroke();
        ltx.fillStyle = "black";
        ltx.font = "30px VT323";
        let xPos = level == 10 ? 18 : 24;
        ltx.fillText(level,xPos,38);
    }

    function drawBlocks(array) {
        array.forEach(block => {
            ctx.fillStyle = block.state.color;
            ctx.strokeStyle = block.state.stroke;
            ctx.fillRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
            ctx.beginPath();
            ctx.rect(block.x+1, block.y+1, BLOCK_SIZE-2, BLOCK_SIZE-2);
            ctx.stroke();

        });        
    }

    function moveDown () {
        const isBottom = activeArr.some(block => block.y+BLOCK_SIZE == GAME_HEIGHT);
        if (!isBottom && !detectCollision() && !isGameOver) {
            activeArr.forEach(block => block.y += BLOCK_SIZE);
        } else {
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
            detectFullLayer();
            updateScore();
            changeSpeed(normalSpeed);
            selectBlock();
        }
    }

    function updateScore() {
        if (deleteCounter) {
            switch (deleteCounter) {
                case 1:
                    score += 40*level;
                    break;
                case 2:
                    score += 100*level;
                    break;
                case 3:
                    score += 300*level;
                    break;
                case 4:
                    score += 1200*level;
                    break;
            }
        }
        deleteCounter = 0;
        scoreOnScreen.textContent = score;
    }
    
    function selectBlock() {
		let number = orderArr.shift();
		let randomArr = generateRandomOrder();
		if (orderArr.length < 9) {
			orderArr = orderArr.concat(randomArr);
		}
        shapeSelector(number);
        shapeSelector(orderArr[0]);
        nextShape = [];
        nextShape = activeArr.splice(-4);
        ntx.clearRect(0,0,nextCanvas.width, nextCanvas.height);
        drawNext(nextShape);
    }

    function drawNext(array) {
        array.forEach(block => {
            const size = BLOCK_SIZE;
            switch (block.state.type) {
                case "O":
                    offsetX = 2.5*size;
                    offsetY = 2.5*size;
                    break;
                case "I":
                    offsetX = 2.5*size;
                    offsetY = 2*size;
                    break;
                default:
                    offsetX = 2*size;
                    offsetY = 2.5*size;
            }
            
            ntx.fillStyle = block.state.color;
            ntx.strokeStyle = block.state.stroke;
            ntx.fillRect(block.x-offsetX, block.y+offsetY, size, size);
            ntx.beginPath();
            ntx.rect(block.x+1-offsetX, block.y+1+offsetY, size-2, size-2);
            ntx.stroke();
        });
    }

    function shapeSelector(number) {
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
                deleteCounter++;
                levelCount++;
                if (levelCount == linesToClear) {
                    level = level < 10 ? ++level : 10;
                    levelCount = 0;
                    normalSpeed = 500 - ((level-1)*50);
                    softDrop = 25 - ((level-1)*3);
                    changeSpeed(normalSpeed);
                }
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

        if (!isGameOver ) {
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

	function rotateJLTBlock(back = false) {
        let coef = back ? -1 : 1;
		let orient = activeArr[0].state.orientation;
        if (back) {
            orient = orient == 0? 3 : --orient
        }
		const type = activeArr[0].state.type;
		const dir1 = orient==0 || orient==3 ? -BLOCK_SIZE : BLOCK_SIZE;
		const dir2 = orient==0 || orient==1 ? BLOCK_SIZE : -BLOCK_SIZE;
		let axis = "";
		
		switch (type) {
			case "L":
				axis = orient % 2 == 0 ? "x" : "y";
				activeArr[1][axis] += 2*dir1*coef;
				break;
			case "J":
				axis = orient % 2 == 1 ? "x" : "y";
				activeArr[1][axis] += 2*dir2*coef;
				break;
			case "T":
				activeArr[1].x += dir1*coef;
				activeArr[1].y += dir2*coef;
				break;
		}

		activeArr[2].x += dir2*coef;
		activeArr[2].y += -dir1*coef;

		activeArr[3].x += -dir2*coef;
		activeArr[3].y += dir1*coef;

		

        if (!back) {
            activeArr[0].state.orientation = orient == 3? 0 : ++orient;
            checkRotation(rotateJLTBlock);
        } 
	}

    function rotateSZBlock(back = false) {
        let orientation = activeArr[0].state.orientation;
        const direction = orientation=="horizontal"?2*BLOCK_SIZE:-2*BLOCK_SIZE;
          
		activeArr[2].x = activeArr[2].x+direction;
		activeArr[3].y = activeArr[3].y-direction;
		activeArr[0].state.orientation = orientation == "horizontal" ? "vertical" : "horizontal";
        
        if (!back) {
            checkRotation(rotateSZBlock);
        } 
    }

    function rotateIBlock(back = false) {
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
        if (!back) {
            checkRotation(rotateIBlock);
        }
    }

    function checkRotation(callback) {
        const exceedsRight = activeArr.some(block => block.x+BLOCK_SIZE > GAME_WIDTH);
        const exceedsLeft = activeArr.some(block => block.x < 0);
        const exceedsBottom = activeArr.some(block => block.y+BLOCK_SIZE > GAME_HEIGHT);
        if (detectCollision() || exceedsLeft || exceedsRight || exceedsBottom) {
            callback(true);
        }
    }
    
    function gameOver() {
        isGameOver = true;
        clearInterval(fallTimerID);

        displayGameOver();

        setTimeout(updateHighScore,750);

        gameOverText.addEventListener("click", ()=>{
            gameOverText.remove();
            playBtn.textContent = "PLAY";
            initNewGame();
        });
        playBtn.removeEventListener("click", pause);
    }

    function updateHighScore() {
        if (highscore < score) {
            highscore = score;
            highscoreOnScreen.textContent = highscore;
            storage.setItem("TetrisHighscore", highscore);
        }
        updateLeaderboard();
    }

    function updateLeaderboard() {
        let leaderboard = storage.getItem("TetrisLeaderboard");
        leaderboard = JSON.parse(leaderboard);
        const lowestScore = leaderboard.reduce((acc, val) => {
            acc = acc<val? acc : val;
            return acc;
        },0);
        if (leaderboard.length < 5 || score>lowestScore[1]) {
            showInputField();
        }
    }

    function addToLeaderboard(name) {
        let leaderboard = JSON.parse(storage.getItem("TetrisLeaderboard"));
        const newEntry = [name, score];
        leaderboard.push(newEntry);
        leaderboard.sort((a, b)=> b[1] - a[1]);
        if (leaderboard.length > 5) {
            leaderboard.pop();
        }
        storage.setItem("TetrisLeaderboard", JSON.stringify(leaderboard));
        displayLeaderboard();
    }

    function showInputField() {
        const title = document.createElement("div");
        title.textContent = "Enter your name";
        const inputField = document.createElement("input");
        inputField.setAttribute("type", "text");
        inputField.setAttribute("placeholder", "Type your name here...");
        const button = document.createElement("button");
        button.textContent = "ENTER";
        namePrompt.append(title, inputField, button);
        namePrompt.classList.add("highscore-input");
        grid.append(namePrompt);
        button.addEventListener("click", ()=> {
            const name = inputField.value;
            namePrompt.remove();
            addToLeaderboard(name);
        });
    }

    function displayLeaderboard() {
        if (onScreenLeadboard.firstChild) return;
        if (!isLeaderboardCreated) {
            generateLeaderboard();
        }

        grid.append(onScreenLeadboard);
    }

    function generateLeaderboard() {
        isLeaderboardCreated = true;
        let counter = 0;
        let leaderboard = storage.getItem("TetrisLeaderboard");
        leaderboard = JSON.parse(leaderboard);
        const leaderboardTitle = document.createElement("div");
        leaderboardTitle.classList.add("leaderboard-title");
        leaderboardTitle.textContent = "LEADERBOARD";
        const closeBtn = document.createElement("button");
        closeBtn.classList.add("close-btn");
        closeBtn.textContent = "CLOSE";

        onScreenLeadboard.classList.add("onScreenLeaderboard");
        onScreenLeadboard.append(leaderboardTitle);
        leaderboard.forEach(entry => {
            let pos = document.createElement("div");
            pos.textContent = ++counter;
            let name = document.createElement("div");
            name.textContent = entry[0];
            let playerscore = document.createElement("div");
            playerscore.textContent = entry[1];
            onScreenLeadboard.append(pos,name,playerscore);
        });
        onScreenLeadboard.append(closeBtn);
        closeBtn.addEventListener("click", ()=> {
            onScreenLeadboard.remove();
            isLeaderboardCreated = false;
            while (onScreenLeadboard.firstChild) {
                onScreenLeadboard.firstChild.remove();
            }
        });
    }

    function displayGameOver() {


        const textGame = document.createElement("div");
        const textOver = document.createElement("div");
        const textPlayAgain = document.createElement("div");
        const textClickHere = document.createElement("div");
        gameOverText.classList.add("gameOverText");
        textGame.textContent = "Game";
        textOver.textContent = "Over";
        textPlayAgain.textContent = "to play again";
        textClickHere.textContent = "Click here";
        textPlayAgain.style.fontSize = "1rem";
        textClickHere.style.fontSize = "1rem";
        gameOverText.append(textGame, textOver, textClickHere, textPlayAgain);
        grid.append(gameOverText);
    }

    function drawGrid() {
        gtx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
        gtx.strokeStyle = "rgba(105,105,105,0.5)";
        gtx.fillStyle = "rgba(105,105,105,0.5)";
        gtx.lineWidth = 0.5;
        for (let i=BLOCK_SIZE; i<GAME_WIDTH; i+=BLOCK_SIZE) {
            for (let j=BLOCK_SIZE; j<GAME_HEIGHT; j+=BLOCK_SIZE) {
               gtx.beginPath();
               gtx.arc(i,j,1,0,2*Math.PI);
               gtx.fill();
            }
        }
    }

    function gameLoop() {
        ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);

        drawBlocks(activeArr);
        drawBlocks(blockArr);
        drawLevelGraphics();
        drawGrid();
        requestAnimationFrame(gameLoop);
    }

    function changeSpeed (speed) {
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
        timer.style.left = "110px";
        timer.style.top = "250px";
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

    function pause() {
        if (playBtn.textContent == "PAUSE") {
            clearInterval(fallTimerID);
            playBtn.textContent = "PLAY";
        } else {
            startCountdown();
            setTimeout(() => {
                changeSpeed(normalSpeed);
            }, 3000);
            playBtn.textContent = "PAUSE";          
        }
    }

    function startGame() {
        startCountdown();
        setTimeout(() => {
            orderArr = generateRandomOrder().concat(generateRandomOrder());
            generateNewBlock();
            changeSpeed(normalSpeed);
        }, 3000);
        playBtn.addEventListener("click", pause);
        playBtn.textContent = "PAUSE";
    }

    function isMobile() {
        try{ document.createEvent("TouchEvent"); return true; }
        catch(e){ return false; }
    }

    // game

    if ('ontouchstart' in window) {
        grid.style.height = "720px";
        mobileControls.classList.remove("hidden");
      }

    playBtn.addEventListener("click", startGame, {once: true});
    ldrbrdBtn.addEventListener("click", displayLeaderboard);

    resetBtn.addEventListener("click", () => {
        clearInterval(fallTimerID);
        initNewGame();
        playBtn.textContent = "PLAY";
        gameOverText.remove();
    });

    gameLoop();

    document.addEventListener("keyup", (event) => {

        switch (event.key) {
            case "ArrowUp":
                rotateBlock();
                break;
            case "ArrowDown":
                changeSpeed(normalSpeed);
                isArrowDown = false;
                break;
            case " ":
                changeSpeed(hardDrop);
            }
    });

    document.addEventListener("keydown", (event) => {

        switch (event.key) {
            case "ArrowDown":
                if (!isArrowDown) {
                    changeSpeed(softDrop);
                    isArrowDown = true;
                }
                break;
            case "ArrowRight":
                shiftRight();
                break;
            case "ArrowLeft":
                shiftLeft();
                break;
        }
    });

    leftBtn.addEventListener("click", () => {
        clearInterval(moveTimerID);
        shiftLeft();
    });
    leftBtn.addEventListener("touchstart", (event)=>{
        event.preventDefault();
        clearInterval(moveTimerID);
        moveTimerID = setInterval(shiftLeft,100);
    });
    leftBtn.addEventListener("touchend", ()=>{
        clearInterval(moveTimerID);
    });
    rightBtn.addEventListener("click", ()=> {
        clearInterval(moveTimerID);
        shiftRight();
    });
    rightBtn.addEventListener("touchstart", ()=>{
        clearInterval(moveTimerID);
        moveTimerID = setInterval(shiftRight,100);
    });
    rightBtn.addEventListener("touchend", ()=>{
        clearInterval(moveTimerID);
    });
    rotateBtn.addEventListener("click", rotateBlock);
    softBtn.addEventListener("touchstart", (event)=>{
        event.preventDefault();
        changeSpeed(softDrop);
    });
    softBtn.addEventListener("touchend", (event)=>{
        event.preventDefault();
        changeSpeed(normalSpeed);
    });
    hardBtn.addEventListener("click", ()=> {
        changeSpeed(hardDrop);
    });
}