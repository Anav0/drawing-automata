import { DrawingStyle } from "../style/drawingStyle.js";
import { Uuid } from "../helpers/uuid.js";

export abstract class Drawing {
  id: string;
  shape: Path2D;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;

  static style: DrawingStyle = new DrawingStyle();

  constructor(ctx, x, y) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.id = Uuid.uuidv4();
  }

  abstract draw(): Drawing;
  abstract onDbClick(): void;
  abstract move(mouseX: number, mouseY: number): void;
  abstract containsPoint(x: number, y: number): boolean;
}
