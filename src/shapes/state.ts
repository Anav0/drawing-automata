import { Drawing } from "./drawing.js";
import { AutomataDrawing } from "./automataDrawing.js";
import { Link } from "./Link.js";
import { StatesLink } from "./StatesLink.js";
import { serializable } from "../helpers/serializable.js";
import { SelfLink } from "./selfLink.js";
import { StartLink } from "./startLink.js";

@serializable
export class State extends AutomataDrawing {
  text: string;
  r: number;
  isAccepting: boolean = false;
  readonly className: string = "State";

  constructor(
    ctx?: CanvasRenderingContext2D,
    x?: number,
    y?: number,
    r?: number,
    text?: string
  ) {
    super(ctx, x, y);
    if (!r) r = 50;
    if (!text) text = "";
    this.text = text;
    this.r = r;
  }

  drawIsAccepting(isAccepting): void {
    this.isAccepting = isAccepting;
    if (this.isAccepting) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = Drawing.style.lineColor;
      this.ctx.arc(this.x, this.y, this.r - 10, 0, 2 * Math.PI, false);
      this.ctx.stroke();
    }
  }

  //TODO: find way to avoid this mess...
  onRetrive(allRetrivedDrawings: Drawing[]) {
    for (let drawing of allRetrivedDrawings) {
      if (drawing instanceof StatesLink) {
        let casted = drawing as StatesLink;
        if (casted.endState.id === this.id) casted.endState = this;
        if (casted.startState.id === this.id) casted.startState = this;
      } else if (drawing instanceof SelfLink) {
        let casted = drawing as SelfLink;
        if (casted.endState.id === this.id) casted.endState = this;
      } else if (drawing instanceof StartLink) {
        let casted = drawing as StartLink;
        if (casted.endState.id === this.id) casted.endState = this;
      }
    }
  }

  move(mouseX: number, mouseY: number): void {
    this.x = mouseX;
    this.y = mouseY;
  }

  delete(drawings: Drawing[]): Drawing[] {
    let links = drawings.filter((drawing) => {
      let link = drawing as Link;

      if (!link.endState) return false;

      let casted = link as StatesLink;

      if (casted.startState) {
        return casted.startState.id == this.id || casted.endState.id == this.id;
      } else {
        return link.endState.id == this.id;
      }
    }) as Link[];

    return drawings.filter((x) => links.indexOf(x as Link) === -1);
  }

  draw(): Drawing {
    let circle = new Path2D();
    circle.arc(this.x, this.y, this.r, 0, Math.PI * 2, true); // Outer circle
    this.ctx.lineWidth = Drawing.style.lineThickness;
    this.ctx.fillStyle = Drawing.style.stateBg;
    this.ctx.strokeStyle = Drawing.style.lineColor;
    this.ctx.fill(circle);
    this.ctx.stroke(circle);
    this.shape = circle;

    this.drawIsAccepting(this.isAccepting);
    this.drawHighlight(this.isHighlighted);
    this.drawText(this.text, this.x, this.y + 6);

    return this;
  }

  onDbClick(): void {
    this.drawIsAccepting(!this.isAccepting);
  }

  closestPointOnCircle(x, y) {
    let dx = x - this.x;
    let dy = y - this.y;
    let scale = Math.sqrt(dx * dx + dy * dy);
    return {
      x: this.x + (dx * this.r) / scale,
      y: this.y + (dy * this.r) / scale,
    };
  }
}
