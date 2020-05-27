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
    if (this.isHighlighted) this.ctx.strokeStyle = "teal";
    else this.ctx.strokeStyle = "black";
    this.ctx.stroke(this.shape);
  }

  abstract drawText(text): void;
}
