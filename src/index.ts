import { State } from "./shapes/state.js";
import { Drawing } from "./shapes/drawing.js";
import { Link } from "./shapes/Link.js";
import { AutomataDrawing } from "./shapes/automataDrawing.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
var isMovingShape = false;
var drawings: Drawing[] = [];
var input = "";

const getMousePosOnCanvas = () => {
  let rect = canvas.getBoundingClientRect();
  let event = window.event as any;
  return {
    x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
};

const getDrawingUnderCursor = (ctx) => {
  const mousePos = getMousePosOnCanvas();
  const { x: mouseX } = mousePos;
  const { y: mouseY } = mousePos;

  for (let drawing of drawings) {
    let isPointInPath = drawing.ctx.isPointInPath(
      drawing.shape,
      mouseX,
      mouseY
    );
    let isPointInStroke = drawing.ctx.isPointInStroke(
      drawing.shape,
      mouseX,
      mouseY
    );
    if (isPointInPath || isPointInStroke) {
      return drawing;
    }
  }
};

const onMouseDown = (event) => {
  const stateUnderCursor = getDrawingUnderCursor(ctx);

  if (stateUnderCursor) {
    isMovingShape = true;
    return;
  }

  const mousePos = getMousePosOnCanvas();

  drawings.push(new State(ctx, mousePos.x, mousePos.y).draw());
};

const onMouseMove = (event) => {
  if (!isMovingShape) return;
  const mousePos = getMousePosOnCanvas();
  let drawing = getDrawingUnderCursor(ctx);

  drawing.x = mousePos.x;
  drawing.y = mousePos.y;

  redraw();
};

const onDbClick = (event) => {
  let drawing = getDrawingUnderCursor(ctx);
  drawing.onDbClick();
};

const onClick = (event) => {
  const clickedDrawing = getDrawingUnderCursor(ctx);
  if (!clickedDrawing) return;
  const automataDrawings = drawings.map(
    (drawing) => drawing as AutomataDrawing
  );
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
  } else {
    input += String.fromCharCode(event.keyCode);
  }

  let hightlightedState = getHighlightedDrawing();
  if (hightlightedState) {
    clearCanvas();
    hightlightedState.drawText(input);
    draw();
  }
};

const onResize = () => {
  resizeCanvas();
  redraw();
};

window.addEventListener("resize", onResize);
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseup", () => (isMovingShape = false));
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("dblclick", onDbClick);
canvas.addEventListener("click", onClick);
window.addEventListener("keydown", onKeyDown);

const resizeCanvas = () => {
  canvas.width = window.innerWidth - 150;
  canvas.height = window.innerHeight - 200;
};

const draw = () => drawings.map((drawing) => drawing.draw());

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const redraw = () => {
  clearCanvas();
  draw();
};

resizeCanvas();
draw();
