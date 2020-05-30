import { Drawing } from "./drawing.js";
import { AutomataDrawing } from "./automataDrawing.js";
import { State } from "./state.js";

export class Link extends AutomataDrawing {
  endX: number;
  endY: number;
  endState: State;
  startState: State;

  constructor(ctx, x, y, endX, endY) {
    super(ctx, x, y);

    this.endX = endX;
    this.endY = endY;
  }

  move(mouseX: number, mouseY: number): void {
    this.endX = mouseX;
    this.endY = mouseY;
  }

  delete(drawings: Drawing[]): Drawing[] {
    return drawings;
  }

  draw(): Drawing {
    if (this.endState) this.setEndAnchor();
    if (this.startState) this.setStartAnchor();

    let line = new Path2D();
    this.ctx.beginPath();
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 4;
    // draw line
    line.moveTo(this.x, this.y);
    line.lineTo(this.endX, this.endY);

    // draw arrowhead
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

  setEndAnchor() {
    let coord = this.endState.closestPointOnCircle(this.x, this.y);
    this.endX = coord.x;
    this.endY = coord.y;
  }

  setStartAnchor() {
    let coord = this.startState.closestPointOnCircle(this.endX, this.endY);
    this.x = coord.x;
    this.y = coord.y;
  }

  setEndState(state: State) {
    this.endState = state;
    this.setEndAnchor();
  }

  setStartState(state: State) {
    this.startState = state;
    this.setStartAnchor();
  }
}
