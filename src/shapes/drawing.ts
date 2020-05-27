export abstract class Drawing {
  id: string;
  shape: Path2D;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;

  constructor(ctx, x, y) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.id = uuidv4();
  }

  abstract draw(): Drawing;
  abstract onDbClick(): void;
}
const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
