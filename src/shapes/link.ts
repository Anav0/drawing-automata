import { Drawing } from "./drawing.js";
import { AutomataDrawing } from "./automataDrawing.js";

export class Link extends AutomataDrawing {
  endX: number;
  endY: number;

  constructor(ctx, x, y, endX, endY) {
    super(ctx, x, y);

    this.endX = endX;
    this.endY = endY;
  }

  draw(): Drawing {
    let line = new Path2D();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 4;
    line.moveTo(this.x, this.y);
    line.lineTo(this.endX, this.endY);
    line.closePath();
    this.ctx.stroke(line);
    this.shape = line;
    return this;
  }

  drawText(text): void {
    this.text = text;
    let textWidth = this.ctx.measureText(text).width;
    this.ctx.fillStyle = "black";
    this.ctx.font = "bold 24px serif";
    this.ctx.fillText(text, this.x - textWidth / 2, this.y + 6);
  }

  onDbClick(): void {
    throw new Error("Method not implemented.");
  }
}
