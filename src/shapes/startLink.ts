import { Drawing } from "./drawing.js";
import { Link } from "./Link.js";
import { State } from "./state.js";
import { serializable } from "../helpers/serializable.js";

@serializable
export class StartLink extends Link {
  deltaX = 0;
  deltaY = 0;
  readonly className: string = "StartLink";

  constructor(ctx?: CanvasRenderingContext2D, x?: number, y?: number) {
    super(ctx, x, y);
    this.text = "START";
  }

  isValid(allDrawings: Drawing[]): boolean {
    if (!this.endState) return false;
    for (let drawing of allDrawings) {
      if (drawing instanceof StartLink) return false;
    }
    return true;
  }

  containsPoint(x: number, y: number): boolean {
    if (!this.endState) return false;
    var stuff = this.getEndPoints();
    var dx = stuff.endX - stuff.startX;
    var dy = stuff.endY - stuff.startY;
    var length = Math.sqrt(dx * dx + dy * dy);
    var percent =
      (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
    var distance = (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;
    return (
      percent > 0 &&
      percent < 1 &&
      Math.abs(distance) < Drawing.style.selectPadding
    );
  }

  onMouseUp(drawingsUnderCursor: Drawing[]): void {
    for (let drawing of drawingsUnderCursor) {
      if (!(drawing instanceof State)) continue;
      this.endState = drawing as State;
      return;
    }
  }

  onDbClick(): void {
    return;
  }

  move(mouseX: number, mouseY: number): void {
    if (this.endState) {
      this.x = mouseX;
      this.y = mouseY;
    } else {
      this.endX = mouseX;
      this.endY = mouseY;
    }
  }

  delete(drawings: Drawing[]): Drawing[] {
    return drawings;
  }

  draw(): Drawing {
    this.text = "START";
    this.ctx.strokeStyle = Drawing.style.lineColor;
    this.ctx.lineWidth = Drawing.style.lineThickness;

    // draw line
    this.ctx.beginPath();
    let line = new Path2D();
    this.shape = line;

    if (this.endState) {
      this.setAnchorPoint();
      let stuff = this.getEndPoints();
      line.moveTo(stuff.startX, stuff.startY);
      line.lineTo(stuff.endX, stuff.endY);
      var textAngle = Math.atan2(
        stuff.startY - stuff.endY,
        stuff.startX - stuff.endX
      );
      this.drawText(this.text, stuff.startX, stuff.startY, textAngle, true);

      // draw the head of the arrow
      this.drawArrow(
        stuff.endX,
        stuff.endY,
        Math.atan2(-this.deltaY, -this.deltaX)
      );
    } else {
      line.moveTo(this.x, this.y);
      line.lineTo(this.endX, this.endY);
      // draw arrowhead
      let angle = Math.atan2(this.endY - this.y, this.endX - this.x);
      this.shape = line;
      this.drawArrow(this.endX, this.endY, angle);

      let textAngle = 0 + 0 / 2 + 0 * Math.PI;
      let textX = (this.x + this.endX) / 2;
      let textY = (this.y + this.endY) / 2;
      this.drawText(this.text, textX, textY - 15, textAngle, true);
    }

    this.ctx.stroke(this.shape);
    if (this.isHighlighted) this.drawHighlight(this.isHighlighted);
    return this;
  }

  getEndPoints() {
    var startX = this.endState.x + this.deltaX;
    var startY = this.endState.y + this.deltaY;
    let coord = this.endState.closestPointOnCircle(this.x, this.y);
    return {
      startX: startX,
      startY: startY,
      endX: coord.x,
      endY: coord.y,
    };
  }

  setAnchorPoint() {
    this.deltaX = this.x - this.endState.x;
    this.deltaY = this.y - this.endState.y;

    if (Math.abs(this.deltaX) < Drawing.style.snap) {
      this.deltaX = 0;
    }

    if (Math.abs(this.deltaY) < Drawing.style.snap) {
      this.deltaY = 0;
    }
  }
}
