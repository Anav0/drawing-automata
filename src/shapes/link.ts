import { Drawing } from "./drawing.js";
import { AutomataDrawing } from "./automataDrawing.js";
import { State } from "./state.js";

export abstract class Link extends AutomataDrawing {
  endX: number;
  endY: number;
  endState: State;

  constructor(ctx, x, y) {
    super(ctx, x, y);
  }

  abstract isValid(allDrawings: Drawing[]): boolean;
  abstract onMouseUp(drawingsUnderCursor: Drawing[]): void;

  delete(drawings: Drawing[]): Drawing[] {
    return drawings;
  }

  drawArrow(x, y, angle) {
    let headlen = Drawing.style.arrowHeadSize;
    this.ctx.beginPath();
    this.shape.moveTo(x, y);
    this.shape.lineTo(
      x - headlen * Math.cos(angle - Math.PI / 6),
      y - headlen * Math.sin(angle - Math.PI / 6)
    );
    this.shape.moveTo(x, y);
    this.shape.lineTo(
      x - headlen * Math.cos(angle + Math.PI / 6),
      y - headlen * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.lineCap = "round";
    this.shape.moveTo(x, y);
    this.ctx.closePath();
    this.ctx.stroke(this.shape);
  }
}
