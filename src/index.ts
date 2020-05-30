import { State } from "./shapes/state.js";
import { Drawing } from "./shapes/drawing.js";
import { Link } from "./shapes/Link.js";
import { AutomataDrawing } from "./shapes/automataDrawing.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
var isMouseDown = false;
var isShiftPressed = false;
var drawings: Drawing[] = [];
var input = "";
var tmpLink: Link;
var movingDrawing: Drawing;

const getMousePosOnCanvas = () => {
  let rect = canvas.getBoundingClientRect();
  let event = window.event as any;
  return {
    x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
};

const getDrawingsUnderCursor = (ctx) => {
  const mousePos = getMousePosOnCanvas();
  let drawingUnderCursor: Drawing[] = [];
  const { x: mouseX } = mousePos;
  const { y: mouseY } = mousePos;

  if (tmpLink) {
    if (
      ctx.isPointInPath(tmpLink.shape, mouseX, mouseY) ||
      ctx.isPointInStroke(tmpLink.shape, mouseX, mouseY)
    ) {
      drawingUnderCursor.push(tmpLink);
    }
  }

  for (let drawing of drawings) {
    let isPointInPath = ctx.isPointInPath(drawing.shape, mouseX, mouseY);
    let isPointInStroke = ctx.isPointInStroke(drawing.shape, mouseX, mouseY);
    if (isPointInPath || isPointInStroke) {
      drawingUnderCursor.push(drawing);
    }
  }
  return drawingUnderCursor;
};

const onMouseUp = (event) => {
  const stateUnderCursor = getDrawingsUnderCursor(ctx);

  for (let underCursorDrawing of stateUnderCursor) {
    if (tmpLink && underCursorDrawing.id !== tmpLink.id) {
      tmpLink.setEndState(underCursorDrawing as State);
      drawings.push(tmpLink);
      break;
    }
  }
  tmpLink = null;
  redraw();
};

const onMouseDown = (event) => {
  isMouseDown = true;
  const drawingUnderCursor = getDrawingsUnderCursor(ctx)[0];
  const mousePos = getMousePosOnCanvas();

  if (isShiftPressed) {
    tmpLink = new Link(ctx, mousePos.x, mousePos.y, mousePos.x, mousePos.y);
    tmpLink.setStartState(drawingUnderCursor as State);
    return;
  } else if (drawingUnderCursor) {
    movingDrawing = drawingUnderCursor;
    return;
  }
  drawings.push(new State(ctx, mousePos.x, mousePos.y).draw());
};

const onMouseMove = (event) => {
  if (!isMouseDown) return;

  const mousePos = getMousePosOnCanvas();
  if (tmpLink && isShiftPressed) {
    tmpLink.move(mousePos.x, mousePos.y);
  } else {
    movingDrawing.move(mousePos.x, mousePos.y);
  }

  redraw();
};

const onDbClick = (event) => {
  let drawing = getDrawingsUnderCursor(ctx)[0];
  drawing.onDbClick();
  redraw();
};

const onClick = (event) => {
  const clickedDrawing = getDrawingsUnderCursor(ctx)[0];
  if (!clickedDrawing) return;

  const automataDrawings = drawings.map(
    (drawing) => drawing as AutomataDrawing
  );
  if (tmpLink) automataDrawings.push(tmpLink);

  for (let automataDrawing of automataDrawings) {
    if (automataDrawing.id === clickedDrawing.id) {
      automataDrawing.drawHighlight(true);
      input = automataDrawing.text;
    } else automataDrawing.drawHighlight(false);
  }
};

const getHighlightedDrawing = () => {
  for (let drawing of drawings) {
    let automataDrawing = drawing as AutomataDrawing;
    if (automataDrawing.isHighlighted) return automataDrawing;
  }
};

const onKeyDown = (event) => {
  if (event.key.toLowerCase() == "backspace") {
    input = input.slice(0, -1);
  } else if (event.key.toLowerCase() == "delete") {
    drawings.splice(drawings.indexOf(getHighlightedDrawing()), 1);
    redraw();
  } else if (event.key.toLowerCase() == "shift") {
    isShiftPressed = true;
  } else {
    let letter = String.fromCharCode(event.keyCode);
    if (!event.shiftKey) letter = letter.toLowerCase();
    input += letter;
  }

  let hightlightedState = getHighlightedDrawing();
  if (hightlightedState) {
    clearCanvas();
    hightlightedState.drawText(input);
    draw();
  }
};

const onKeyUp = (event) => {
  if (event.key.toLowerCase() == "shift") {
    isShiftPressed = false;
  }
};

const onResize = () => {
  resizeCanvas();
  redraw();
};

window.addEventListener("resize", onResize);
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseup", onMouseUp);
canvas.addEventListener("mouseup", () => (isMouseDown = false));
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("dblclick", onDbClick);
canvas.addEventListener("click", onClick);
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

const resizeCanvas = () => {
  canvas.width = window.innerWidth - 150;
  canvas.height = window.innerHeight - 200;
};

const draw = () => {
  drawings.map((drawing) => drawing.draw());

  if (tmpLink) tmpLink.draw();
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const redraw = () => {
  clearCanvas();
  draw();
};

resizeCanvas();
draw();
