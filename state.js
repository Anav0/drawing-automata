export class State {
  id;
  shape;
  text = "";
  isAccepting = false;
  isHighlighted;
  x;
  y;
  r;

  constructor(shape, x, y, r) {
    this.id = uuidv4();
    this.shape = shape;
    this.y = y;
    this.x = x;
    this.r = r;
  }

  setIsAccepting(ctx, isAccepting) {
    this.isAccepting = isAccepting;
    if (this.isAccepting) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r - 10, 0, 2 * Math.PI, false);
      ctx.stroke();
    }
  }

  setHightLight(ctx, isHighlighted) {
    this.isHighlighted = isHighlighted;
    if (this.isHighlighted) ctx.strokeStyle = "green";
    else ctx.strokeStyle = "black";
    ctx.stroke(this.shape);
  }

  addText(ctx, text) {
    let textWidth = ctx.measureText(text).width;
    ctx.fillStyle = "black";
    ctx.font = "bold 24px serif";
    ctx.fillText(text, this.x - textWidth / 2, this.y + 6);
    this.text = text;
  }
}
const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
