import { Drawing } from "../shapes/drawing.js";
import { Link } from "../shapes/link.js";
import { State } from "../shapes/state.js";
import { SelfLink } from "../shapes/selfLink.js";
import { StatesLink } from "../shapes/statesLink.js";

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
