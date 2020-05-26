export class State {
  id;
  shape;
  text;
  isAccepting = false;
  isHighlighted = false;
  x;
  y;
  r;
  ctx;

  constructor(ctx, x, y, r = 50, text = "") {
    this.id = uuidv4();
    this.ctx = ctx;
    this.text = text;
    this.y = y;
    this.x = x;
    this.r = r;
  }

  setIsAccepting(isAccepting) {
    this.isAccepting = isAccepting;
    if (this.isAccepting) {
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.r - 10, 0, 2 * Math.PI, false);
      this.ctx.stroke();
    }
  }

  setHightLight(isHighlighted) {
    this.isHighlighted = isHighlighted;
    if (this.isHighlighted) this.ctx.strokeStyle = "teal";
    else this.ctx.strokeStyle = "black";
    this.ctx.stroke(this.shape);
  }

  drawText(text) {
    this.text = text;
    let textWidth = this.ctx.measureText(text).width;
    this.ctx.fillStyle = "black";
    this.ctx.font = "bold 24px serif";
    this.ctx.fillText(text, this.x - textWidth / 2, this.y + 6);
  }

  draw() {
    const strokeThicc = 4;
    const strokeColor = "black";
    const bgColor = "transparent";
    let circle = new Path2D();
    circle.arc(this.x, this.y, this.r, 0, Math.PI * 2, true); // Outer circle
    this.ctx.lineWidth = strokeThicc;
    this.ctx.fillStyle = bgColor;
    this.ctx.fill(circle);
    this.ctx.strokeStyle = strokeColor;
    this.ctx.stroke(circle);
    this.shape = circle;

    this.setIsAccepting(this.isAccepting);
    this.setHightLight(this.isHighlighted);
    this.drawText(this.text);

    return this;
  }
}
const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
