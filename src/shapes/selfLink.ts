import { Drawing } from "./drawing";
import { Link } from "./link";
import { State } from "./state";
import { serializable } from "../helpers/serializable";

@serializable
export class SelfLink extends Link {
  anchorAngle: number = 0;
  readonly className: string = "SelfLink";

  constructor(
    ctx?: CanvasRenderingContext2D,
    x?: number,
    y?: number,
    endState?: State
  ) {
    super(ctx, x, y);
    this.endState = endState;
  }

  containsPoint(x: number, y: number): boolean {
    var stuff = this.getEndPointsAndCircle();
    var dx = x - stuff.circleX;
    var dy = y - stuff.circleY;
    var distance = Math.sqrt(dx * dx + dy * dy) - stuff.circleRadius;
    return Math.abs(distance) < Drawing.style.selectPadding;
  }

  getEndPointsAndCircle() {
    var circleX =
      this.endState.x + 1.5 * this.endState.r * Math.cos(this.anchorAngle);
    var circleY =
      this.endState.y + 1.5 * this.endState.r * Math.sin(this.anchorAngle);
    var circleRadius = 0.75 * this.endState.r;
    var startAngle = this.anchorAngle - Math.PI * 0.8;
    var endAngle = this.anchorAngle + Math.PI * 0.8;
    var startX = circleX + circleRadius * Math.cos(startAngle);
    var startY = circleY + circleRadius * Math.sin(startAngle);
    var endX = circleX + circleRadius * Math.cos(endAngle);
    var endY = circleY + circleRadius * Math.sin(endAngle);
    return {
      hasCircle: true,
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      startAngle: startAngle,
      endAngle: endAngle,
      circleX: circleX,
      circleY: circleY,
      circleRadius: circleRadius,
    };
  }

  move(mouseX: number, mouseY: number): void {
    this.x = mouseX;
    this.y = mouseY;
    this.setAnchorPoint();
  }

  setAnchorPoint() {
    this.anchorAngle = Math.atan2(
      this.y - this.endState.y,
      this.x - this.endState.x
    );
    // snap to 90 degrees
    var snap = Math.round(this.anchorAngle / (Math.PI / 2)) * (Math.PI / 2);
    if (Math.abs(this.anchorAngle - snap) < 0.1) this.anchorAngle = snap;
    // keep in the range -pi to pi so our containsPoint() function always works
    if (this.anchorAngle < -Math.PI) this.anchorAngle += 2 * Math.PI;
    if (this.anchorAngle > Math.PI) this.anchorAngle -= 2 * Math.PI;
  }

  isValid(allDrawings: Drawing[]): boolean {
    for (let drawing of allDrawings) {
      if (drawing instanceof SelfLink) {
        let casted = drawing as SelfLink;
        if (casted.endState.id == this.endState.id) return false;
      }
    }
    return true;
  }

  onMouseUp(drawingsUnderCursor: Drawing[]): void {
    return;
  }

  delete(drawings: Drawing[]): Drawing[] {
    return drawings;
  }

  draw(): Drawing {
    if (this.endState) this.setEndAnchor();

    this.ctx.strokeStyle = Drawing.style.lineColor;
    this.ctx.lineWidth = Drawing.style.lineThickness;

    let stuff = this.getSelfLoopCircle();

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

    this.shape = line;
    this.drawArrow(stuff.endX, stuff.endY, stuff.endAngle + Math.PI * 0.4);

    let point = this.getCirclePoint();
    let textX = point.circleX + point.circleRadius * Math.cos(this.anchorAngle);
    var textY = point.circleY + point.circleRadius * Math.sin(this.anchorAngle);
    this.drawText(this.text, textX, textY, this.anchorAngle, true);

    this.ctx.stroke(this.shape);

    if (this.isHighlighted) this.drawHighlight(this.isHighlighted);

    return this;
  }

  getSelfLoopCircle() {
    var circleX =
      this.endState.x + 1.5 * this.endState.r * Math.cos(this.anchorAngle);
    var circleY =
      this.endState.y + 1.5 * this.endState.r * Math.sin(this.anchorAngle);
    var circleRadius = 0.75 * this.endState.r;
    var startAngle = this.anchorAngle - Math.PI * 0.8;
    var endAngle = this.anchorAngle + Math.PI * 0.8;
    var startX = circleX + circleRadius * Math.cos(startAngle);
    var startY = circleY + circleRadius * Math.sin(startAngle);
    var endX = circleX + circleRadius * Math.cos(endAngle);
    var endY = circleY + circleRadius * Math.sin(endAngle);
    return {
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      startAngle: startAngle,
      endAngle: endAngle,
      circleX: circleX,
      circleY: circleY,
      circleRadius: circleRadius,
    };
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
}
