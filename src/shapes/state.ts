import { Drawing } from "./drawing.js";
import { AutomataDrawing } from "./automataDrawing.js";

export class State extends AutomataDrawing {
  text: string;
  r: number;
  isAccepting: boolean = false;

  constructor(ctx, x, y, r = 50, text = "") {
    super(ctx, x, y);
    this.text = text;
    this.r = r;
  }

  drawIsAccepting(isAccepting): void {
    this.isAccepting = isAccepting;
    if (this.isAccepting) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = "black";
      this.ctx.arc(this.x, this.y, this.r - 10, 0, 2 * Math.PI, false);
      this.ctx.stroke();
    }
  }

  drawText(text): void {
    this.text = text;
    let textWidth = this.ctx.measureText(text).width;
    this.ctx.fillStyle = "black";
    this.ctx.font = "bold 24px serif";
    this.ctx.fillText(text, this.x - textWidth / 2, this.y + 6);
  }

  draw(): Drawing {
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

    this.drawIsAccepting(this.isAccepting);
    this.drawHighlight(this.isHighlighted);
    this.drawText(this.text);

    return this;
  }

  onDbClick(): void {
    this.drawIsAccepting(!this.isAccepting);
  }
}
