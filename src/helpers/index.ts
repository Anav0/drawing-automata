import { Drawing } from "../shapes/drawing.js";
import { Link } from "../shapes/link.js";
import { State } from "../shapes/state.js";

export const getMousePosOnCanvas = (canvas: HTMLCanvasElement) => {
  let rect = canvas.getBoundingClientRect();
  let event = window.event as any;
  return {
    x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
};

export const getDrawingsUnderCursor = (
  ctx: CanvasRenderingContext2D,
  tmpLink: Link,
  drawings: Drawing[]
) => {
  const mousePos = getMousePosOnCanvas(ctx.canvas);
  let drawingsUnderCursor: Drawing[] = [];

  const { x: mouseX } = mousePos;
  const { y: mouseY } = mousePos;

  if (tmpLink) {
    if (
      ctx.isPointInPath(tmpLink.shape, mouseX, mouseY) ||
      ctx.isPointInStroke(tmpLink.shape, mouseX, mouseY)
    ) {
      drawingsUnderCursor.push(tmpLink);
    }
  }

  for (let drawing of drawings) {
    let isPointInPath = ctx.isPointInPath(drawing.shape, mouseX, mouseY);
    let isPointInStroke = ctx.isPointInStroke(drawing.shape, mouseX, mouseY);
    if (isPointInPath || isPointInStroke) {
      drawingsUnderCursor.push(drawing);
    }
  }
  return drawingsUnderCursor;
};

export const snapState = (state: State, drawings: Drawing[]) => {
  for (let drawing of drawings) {
    if (drawing.id == state.id) continue;
    if (drawing instanceof State) {
      if (Math.abs(state.x - drawing.x) < Drawing.style.snap) {
        state.x = drawing.x;
      }

      if (Math.abs(state.y - drawing.y) < Drawing.style.snap) {
        state.y = drawing.y;
      }
    }
  }
};
