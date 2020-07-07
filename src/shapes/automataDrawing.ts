import { Drawing } from "./drawing.js";

export abstract class AutomataDrawing extends Drawing {
  text: string;
  isHighlighted: boolean = false;

  constructor(ctx, x, y, text = "") {
    super(ctx, x, y);
    this.text = text;
  }

  drawHighlight(isHighlighted): void {
    this.isHighlighted = isHighlighted;
    if (this.isHighlighted) {
      this.ctx.strokeStyle = Drawing.style.highlightColor;
    } else {
      this.ctx.strokeStyle = Drawing.style.lineColor;
    }
    this.ctx.stroke(this.shape);
  }

  drawText(
    text: string,
    textX: number,
    textY: number,
    angle: number = null,
    centerText: boolean = true
  ): void {
    this.text = text;
    let textWidth = this.ctx.measureText(text).width;
    this.ctx.fillStyle = Drawing.style.lineColor;
    this.ctx.font = Drawing.style.textStyle;

    if (angle != null) {
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      var cornerPointX = (textWidth / 2 + 5) * (cos > 0 ? 1 : -1);
      var cornerPointY = 20 * (sin > 0 ? 1 : -1);
      var slide =
        sin * Math.pow(Math.abs(sin), 40) * cornerPointX -
        cos * Math.pow(Math.abs(cos), 10) * cornerPointY;
      textX += cornerPointX - sin * slide;
      textY += cornerPointY + cos * slide;
    }

    if (centerText) this.ctx.fillText(text, textX - textWidth / 2, textY);
    else this.ctx.fillText(text, textX, textY);
  }

  abstract delete(drawings: Drawing[]): Drawing[];
}
