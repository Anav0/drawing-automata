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

  move(mouseX: number, mouseY: number): void {
    this.endX = mouseX;
    this.endY = mouseY;
  }

  draw(): Drawing {
    let line = new Path2D();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 4;
    line.moveTo(this.x, this.y);
    line.lineTo(this.endX, this.endY);
    let headlen = this.ctx.lineWidth * 5;
    let arrowSpread = 6;
    let angle = Math.atan2(this.endY - this.y, this.endX - this.x);
    line.moveTo(this.endX, this.endY);
    line.lineTo(
      this.endX - headlen * Math.cos(angle - Math.PI / arrowSpread),
      this.endY - headlen * Math.sin(angle - Math.PI / arrowSpread)
    );
    line.moveTo(this.endX, this.endY);
    line.lineTo(
      this.endX - headlen * Math.cos(angle + Math.PI / arrowSpread),
      this.endY - headlen * Math.sin(angle + Math.PI / arrowSpread)
    );

    line.closePath();
    this.ctx.stroke(line);
    this.shape = line;

    this.drawText(this.text);

    return this;
  }

  drawText(text): void {
    this.text = text;

    var textX = (this.x + this.endX) / 2;
    var textY = (this.y + this.endY) / 2;
    let textWidth = this.ctx.measureText(text).width / 2;

    this.ctx.fillStyle = "black";
    this.ctx.font = "bold 24px serif";
    let offsetX = Math.abs(this.y - this.endY) > 50 ? 20 : 0;
    this.ctx.fillText(text, textX - textWidth - offsetX, textY - 20);
  }

  onDbClick(): void {
    throw new Error("Method not implemented.");
  }
}
