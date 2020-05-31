import { Drawing } from "./drawing.js";
import { AutomataDrawing } from "./automataDrawing.js";
import { State } from "./state.js";

export class Link extends AutomataDrawing {
  endX: number;
  endY: number;
  endState: State;
  startState: State;
  anchorAngle: number = 0;
  mouseOffsetAngle: number = 0;
  parallelPart: number = 0.5;
  perpendicularPart: number = 0;

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

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 8;

    let line;
    if (
      this.startState &&
      this.endState &&
      this.startState.id === this.endState.id
    ) {
      line = this.drawCircle();
      var stuff = this.getCirclePoint();
      var textX =
        stuff.circleX + stuff.circleRadius * Math.cos(this.anchorAngle);
      var textY =
        stuff.circleY + stuff.circleRadius * Math.sin(this.anchorAngle);
      this.drawText(this.text, textX, textY, this.anchorAngle, false);
    } else {
      line = this.drawStraight();
      let offsetX = Math.abs(this.y - this.endY) > 50 ? 20 : 0;
      this.drawText(
        this.text,
        (this.x + this.endX) / 2 - offsetX,
        (this.y + this.endY) / 2 - 20
      );
    }
    this.shape = line;
    return this;
  }

  drawStraight(): Path2D {
    // draw line
    this.ctx.beginPath();
    let line = new Path2D();

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
    return line;
  }

  drawCircle(): Path2D {
    this.mouseOffsetAngle =
      this.anchorAngle -
      Math.atan2(this.y - this.endState.y, this.x - this.endState.x);

    let stuff = this.getCirclePoint();

    let line = new Path2D();
    // draw arc
    this.ctx.beginPath();
    line.arc(
      stuff.circleX,
      stuff.circleY,
      stuff.circleRadius,
      stuff.startAngle,
      stuff.endAngle,
      false
    );
    this.ctx.stroke(line);

    return line;
  }

  onDbClick(): void {
    return;
  }

  getCirclePoint() {
    let circleX =
      this.endState.x + 1.5 * this.endState.r * Math.cos(this.anchorAngle);
    let circleY =
      this.endState.y + 1.5 * this.endState.r * Math.sin(this.anchorAngle);
    let circleRadius = 0.75 * this.endState.r;
    let startAngle = this.anchorAngle - Math.PI * 0.8;
    let endAngle = this.anchorAngle + Math.PI * 0.8;

    return {
      circleX,
      circleY,
      circleRadius,
      startAngle,
      endAngle,
    };
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

  setAnchorAngle() {
    this.anchorAngle =
      Math.atan2(this.y - this.endState.y, this.x - this.endState.x) +
      this.mouseOffsetAngle;
    // snap to 90 degrees
    var snap = Math.round(this.anchorAngle / (Math.PI / 2)) * (Math.PI / 2);
    if (Math.abs(this.anchorAngle - snap) < 0.1) this.anchorAngle = snap;
    if (this.anchorAngle < -Math.PI) this.anchorAngle += 2 * Math.PI;
    if (this.anchorAngle > Math.PI) this.anchorAngle -= 2 * Math.PI;
  }

  setEndState(state: State) {
    this.endState = state;
    this.setEndAnchor();
    this.setAnchorAngle();
  }

  setStartState(state: State) {
    this.startState = state;
    this.setStartAnchor();
  }
}
