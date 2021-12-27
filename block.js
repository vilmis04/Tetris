export default class Block {
    constructor (posX, posY) {
        // this.x = x;
        // this.y = y;

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
        this.position.y += BLOCK_SIZE;
    }
}