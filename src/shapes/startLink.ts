import { Drawing } from "./drawing.js";
import { Link } from "./Link.js";
import { State } from "./state.js";
import { serializable } from "../helpers/serializable.js";

@serializable
export class StartLink extends Link {
  anchorAngle: number = 0;
  mouseOffsetAngle: number = 0;
  parallelPart: number = 0.5;
  perpendicularPart: number = 0;
  lineAngleAdjust: number = 0;
  scaleModifier = 1;
  prevMouseY = 0;
  readonly className: string = "StartLink";

  constructor(ctx?: CanvasRenderingContext2D, x?: number, y?: number) {
    super(ctx, x, y);
    this.text = "START";
  }

  isValid(): boolean {
    return this.endState ? true : false;
  }

  onMouseUp(drawingsUnderCursor: Drawing[]): void {
    for (let drawing of drawingsUnderCursor) {
      if (!(drawing instanceof State)) continue;
      this.setEndState(drawing as State);
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
    if (this.endState) this.setEndAnchor();
    this.text = "START";

    this.ctx.strokeStyle = Drawing.style.lineColor;
    this.ctx.lineWidth = Drawing.style.lineThickness;

    // draw line
    this.ctx.beginPath();
    let line = new Path2D();

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

    this.ctx.stroke(this.shape);
    if (this.isHighlighted) this.drawHighlight(this.isHighlighted);
    return this;
  }

  setEndAnchor() {
    let coord = this.endState.closestPointOnCircle(this.x, this.y);
    this.endX = coord.x;
    this.endY = coord.y;
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
}
