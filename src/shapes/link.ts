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
  lineAngleAdjust: number = 0;
  scaleModifier = 1;

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
    this.ctx.lineWidth = 4;

    var line;

    if (
      this.startState &&
      this.endState &&
      this.startState.id !== this.endState.id
    ) {
      line = new Path2D();
      this.setAnchorPoint();
      let stuff = this.getEndPointsAndCircle();
      line.arc(
        stuff.circleX,
        stuff.circleY,
        stuff.circleRadius,
        stuff.startAngle,
        stuff.endAngle,
        stuff.isReversed
      );
      this.drawArrow(
        stuff.endX,
        stuff.endY,
        stuff.endAngle - stuff.reverseScale * (Math.PI / 2)
      );
      this.ctx.stroke(line);
      this.shape = line;
      let ddd = stuff.isReversed ? 1 : 0;
      var startAngle = stuff.startAngle;
      var endAngle = stuff.endAngle;
      if (endAngle < startAngle) {
        endAngle += Math.PI * 2;
      }
      let textAngle = (startAngle + endAngle) / 2 + ddd * Math.PI;
      let textX = stuff.circleX + stuff.circleRadius * Math.cos(textAngle);
      let textY = stuff.circleY + stuff.circleRadius * Math.sin(textAngle);
      this.drawText(this.text, textX, textY, textAngle, false);

      return this;
    }

    if (
      this.startState &&
      this.endState &&
      this.startState.id === this.endState.id
    ) {
      line = this.drawCircleToSelf();
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
    let angle = Math.atan2(this.endY - this.y, this.endX - this.x);
    this.drawArrow(this.endX, this.endY, angle);

    line.closePath();
    this.ctx.stroke(line);
    return line;
  }

  drawCircleToSelf(): Path2D {
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

  getEndPointsAndCircle() {
    if (this.perpendicularPart == 0) {
      let midX = (this.startState.x + this.endState.x) / 2;
      let midY = (this.startState.y + this.endState.y) / 2;
      let endCoord = this.endState.closestPointOnCircle(midX, midY);
      let startCoord = this.startState.closestPointOnCircle(midX, midY);
      return {
        hasCircle: false,
        startX: startCoord.x,
        startY: startCoord.y,
        endX: endCoord.x,
        endY: endCoord.y,
      };
    }

    let anchor = this.getAnchorPoint();

    var circle = this.circleFromThreePoints(
      this.startState.x,
      this.startState.y,
      this.endState.x,
      this.endState.y,
      anchor.x,
      anchor.y
    );
    var isReversed = this.perpendicularPart > 0;
    var reverseScale = isReversed ? 1 : -1;
    var startAngle =
      Math.atan2(this.startState.y - circle.y, this.startState.x - circle.x) -
      (reverseScale * this.startState.r) / circle.radius;
    var endAngle =
      Math.atan2(this.endState.y - circle.y, this.endState.x - circle.x) +
      (reverseScale * this.endState.r) / circle.radius;

    var startX = circle.x + circle.radius * Math.cos(startAngle);
    var startY = circle.y + circle.radius * Math.sin(startAngle);
    var endX = circle.x + circle.radius * Math.cos(endAngle);
    var endY = circle.y + circle.radius * Math.sin(endAngle);
    return {
      hasCircle: true,
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      startAngle: startAngle,
      endAngle: endAngle,
      circleX: circle.x,
      circleY: circle.y,
      circleRadius: circle.radius,
      reverseScale: reverseScale,
      isReversed: isReversed,
    };
  }

  setAnchorPoint() {
    let diffX = this.endState.x - this.startState.x;
    let diffY = this.endState.y - this.startState.y;
    let scale = Math.sqrt(diffX * diffX + diffY * diffY);
    scale = scale * this.scaleModifier;
    this.parallelPart =
      (diffX * (this.x - this.startState.x) +
        diffY * (this.y - this.startState.y)) /
      (scale * scale);
    this.perpendicularPart =
      (diffX * (diffY - this.startState.y) -
        diffY * (this.x - this.startState.x)) /
      scale;
  }

  drawArrow(x, y, angle) {
    let dx = Math.cos(angle);
    let dy = Math.sin(angle);
    let headlen = 20;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x - headlen * dx + headlen * 0.5 * dy,
      y - headlen * dy - headlen * 0.5 * dx
    );
    this.ctx.lineTo(
      x - headlen * dx - headlen * 0.5 * dy,
      y - headlen * dy + headlen * 0.5 * dx
    );

    this.ctx.fill();
  }

  getAnchorPoint() {
    let diffX = this.startState.x - this.endState.x;
    let diffY = this.startState.y - this.endState.y;
    let scale = Math.sqrt(diffX * diffX + diffY * diffY);
    return {
      x:
        this.startState.x +
        diffX * this.parallelPart -
        (diffY * this.perpendicularPart) / scale,
      y:
        this.startState.y +
        diffY * this.parallelPart +
        (diffX * this.perpendicularPart) / scale,
    };
  }

  onDbClick(): void {
    if (this.scaleModifier === 1) this.scaleModifier = -1;
    else this.scaleModifier = 1;
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

  det(a, b, c, d, e, f, g, h, i) {
    return (
      a * e * i + b * f * g + c * d * h - a * f * h - b * d * i - c * e * g
    );
  }

  circleFromThreePoints(x1, y1, x2, y2, x3, y3) {
    var a = this.det(x1, y1, 1, x2, y2, 1, x3, y3, 1);
    var bx = -this.det(
      x1 * x1 + y1 * y1,
      y1,
      1,
      x2 * x2 + y2 * y2,
      y2,
      1,
      x3 * x3 + y3 * y3,
      y3,
      1
    );
    var by = this.det(
      x1 * x1 + y1 * y1,
      x1,
      1,
      x2 * x2 + y2 * y2,
      x2,
      1,
      x3 * x3 + y3 * y3,
      x3,
      1
    );
    var c = -this.det(
      x1 * x1 + y1 * y1,
      x1,
      y1,
      x2 * x2 + y2 * y2,
      x2,
      y2,
      x3 * x3 + y3 * y3,
      x3,
      y3
    );
    return {
      x: -bx / (2 * a),
      y: -by / (2 * a),
      radius: Math.sqrt(bx * bx + by * by - 4 * a * c) / (2 * Math.abs(a)),
    };
  }
}
