import { Drawing } from "./drawing.js";
import { Link } from "./Link.js";
import { State } from "./state.js";
import { serializable } from "../helpers/serializable.js";
import { getMousePosOnCanvas } from "../helpers/index.js";

@serializable
export class StatesLink extends Link {
  startState: State;
  anchorAngle: number = 0;
  mouseOffsetAngle: number = 0;
  parallelPart: number = 0.5;
  perpendicularPart: number = 0;
  prevMouseY = 0;
  lineAngleAdjust = 0;
  readonly className: string = "StatesLink";

  constructor(
    ctx?: CanvasRenderingContext2D,
    x?: number,
    y?: number,
    startState?: State
  ) {
    super(ctx, x, y);
    this.startState = startState;
  }

  containsPoint(x: number, y: number): boolean {
    if (!this.endState) return false;
    var stuff = this.getEndPointsAndCircle();
    if (stuff.hasCircle) {
      var dx = x - stuff.circleX;
      var dy = y - stuff.circleY;
      var distance = Math.sqrt(dx * dx + dy * dy) - stuff.circleRadius;
      if (Math.abs(distance) < Drawing.style.selectPadding) {
        var angle = Math.atan2(dy, dx);
        var startAngle = stuff.startAngle;
        var endAngle = stuff.endAngle;
        if (stuff.isReversed) {
          var temp = startAngle;
          startAngle = endAngle;
          endAngle = temp;
        }
        if (endAngle < startAngle) {
          endAngle += Math.PI * 2;
        }
        if (angle < startAngle) {
          angle += Math.PI * 2;
        } else if (angle > endAngle) {
          angle -= Math.PI * 2;
        }
        return angle > startAngle && angle < endAngle;
      }
    } else {
      var dx = stuff.endX - stuff.startX;
      var dy = stuff.endY - stuff.startY;
      var length = Math.sqrt(dx * dx + dy * dy);
      var percent =
        (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
      var distance =
        (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;
      return (
        percent > 0 && percent < 1 && Math.abs(distance) < Drawing.style.snap
      );
    }
    return false;
  }

  isValid(allDrawings: Drawing[]): boolean {
    if (!this.startState || !this.endState) return false;

    for (let drawing of allDrawings) {
      if (drawing instanceof StatesLink) {
        let casted = drawing as StatesLink;
        if (
          casted.startState.id == this.startState.id &&
          casted.endState.id == this.endState.id
        )
          return false;
      }
    }
    return true;
  }

  onMouseUp(drawingsUnderCursor: Drawing[]): void {
    for (let drawing of drawingsUnderCursor) {
      if (!(drawing instanceof State)) continue;
      this.setEndState(drawing as State);
      return;
    }
  }

  move(mouseX: number, mouseY: number): void {
    this.endX = mouseX;
    this.endY = mouseY;
    if (this.endState) this.setAnchorPoint(mouseX, mouseY);
  }

  delete(drawings: Drawing[]): Drawing[] {
    return drawings;
  }

  draw(): Drawing {
    if (this.endState) this.setEndAnchor();
    if (this.startState) this.setStartAnchor();

    this.ctx.strokeStyle = Drawing.style.lineColor;
    this.ctx.lineWidth = Drawing.style.lineThickness;

    if (
      this.startState &&
      this.endState &&
      this.startState.id !== this.endState.id
    ) {
      this.shape = this.drawBend();
    } else {
      this.shape = this.drawStraight();
    }
    if (this.isHighlighted) this.drawHighlight(this.isHighlighted);
    return this;
  }

  drawBend(): Path2D {
    this.ctx.beginPath();
    let line = new Path2D();
    this.shape = line;
    let stuff = this.getEndPointsAndCircle();
    if (stuff.hasCircle) {
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
      var startAngle = stuff.startAngle;
      var endAngle = stuff.endAngle;
      if (endAngle < startAngle) {
        endAngle += Math.PI * 2;
      }
      let isReversed = stuff.isReversed ? 1 : 0;
      var textAngle = (startAngle + endAngle) / 2 + isReversed * Math.PI;
      var textX = stuff.circleX + stuff.circleRadius * Math.cos(textAngle);
      var textY = stuff.circleY + stuff.circleRadius * Math.sin(textAngle);
      this.drawText(this.text, textX, textY + 5, textAngle, true);
    } else {
      line.moveTo(stuff.startX, stuff.startY);
      line.lineTo(stuff.endX, stuff.endY);
      this.drawArrow(
        stuff.endX,
        stuff.endY,
        Math.atan2(stuff.endY - stuff.startY, stuff.endX - stuff.startX)
      );
      var textX = (stuff.startX + stuff.endX) / 2;
      var textY = (stuff.startY + stuff.endY) / 2;
      var textAngle = Math.atan2(
        stuff.endX - stuff.startX,
        stuff.startY - stuff.endY
      );
      this.drawText(
        this.text,
        textX,
        textY,
        textAngle + this.lineAngleAdjust,
        true
      );
    }

    this.shape = line;

    this.ctx.stroke(this.shape);
    return line;
  }

  drawStraight(): Path2D {
    // draw line
    this.ctx.beginPath();
    let line = new Path2D();

    line.moveTo(this.x, this.y);
    line.lineTo(this.endX, this.endY);

    // draw arrowhead
    let angle = Math.atan2(this.endY - this.y, this.endX - this.x);

    this.shape = line;
    this.drawArrow(this.endX, this.endY, angle);

    this.ctx.stroke(this.shape);
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

  setAnchorPoint(x, y) {
    let diffX = this.endState.x - this.startState.x;
    let diffY = this.endState.y - this.startState.y;
    let scale = Math.sqrt(diffX * diffX + diffY * diffY);
    this.parallelPart =
      (diffX * (x - this.startState.x) + diffY * (y - this.startState.y)) /
      (scale * scale);
    this.perpendicularPart =
      (diffX * (y - this.startState.y) - diffY * (x - this.startState.x)) /
      scale;
    if (
      this.parallelPart > 0 &&
      this.parallelPart < 1 &&
      Math.abs(this.perpendicularPart) < Drawing.style.snap
    ) {
      this.lineAngleAdjust = Math.PI;
      this.perpendicularPart = 0;
    }
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
    let tmp = this.startState;
    this.startState = this.endState;
    this.endState = tmp;
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
