import { State } from "./state.js";

const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");
var isMovingShape = false;
var states = [];
var input = "";
var hightlightedState;
const onResize = () => {
  resizeCanvas();
  clearCanvas();
  draw();
};

const getMousePos = (event) => {
  let pos = event.target.getBoundingClientRect();
  let x = event.clientX - pos.left;
  let y = event.clientY - pos.top;
  return { x, y };
};

const onMouseDown = (event) => {
  const stateUnderCursor = getStateUnderCursor(ctx, event);

  if (stateUnderCursor) {
    isMovingShape = true;
    return;
  }

  const mousePos = getMousePos(event);
  drawState(mousePos.x, mousePos.y);
};

const getStateUnderCursor = (ctx, event) => {
  const mousePos = getMousePos(event);
  const { x: mouseX } = mousePos;
  const { y: mouseY } = mousePos;

  for (let state of states) {
    if (ctx.isPointInPath(state.shape, mouseX, mouseY)) {
      return state;
    }
  }
};

const onMouseMove = (event) => {
  if (!isMovingShape) return;
  const mousePos = getMousePos(event);

  let state = getStateUnderCursor(ctx, event);
  state.x = mousePos.x;
  state.y = mousePos.y;

  clearCanvas();
  draw();
};

const onDbClick = (event) => {
  let state = getStateUnderCursor(ctx, event);
  state.setIsAccepting(ctx, !state.isAccepting);
  clearCanvas();
  draw();
};

const onClick = (event) => {
  const mousePos = getMousePos(event);

  for (let state of states) {
    if (ctx.isPointInPath(state.shape, mousePos.x, mousePos.y)) {
      state.setHightLight(ctx, true);
      hightlightedState = state;
      input = state.text;
    } else state.setHightLight(ctx, false);
  }
};

const onKeyDown = async (event) => {
  if (event.key.toLowerCase() == "backspace") {
    input = input.slice(0, -1);
  } else if (event.key.toLowerCase() == "delete") {
    states.splice(states.indexOf(hightlightedState), 1);
    hightlightedState = null;
    clearCanvas();
    draw();
  } else {
    input += String.fromCharCode(event.keyCode);
  }

  if (hightlightedState) {
    clearCanvas();
    hightlightedState.addText(ctx, input);
    draw();
  }
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

const draw = () => {
  let statesCopy = states;
  states = [];
  for (let state of statesCopy) {
    let newState = drawState(state.x, state.y, state.r, state.text);
    newState.setIsAccepting(ctx, state.isAccepting);
    if (state.isHighlighted) {
      newState.setHightLight(ctx, state.isHighlighted);
      hightlightedState = newState;
    }
  }
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const drawState = (
  x,
  y,
  r = 50,
  text = "",
  strokeThicc = 4,
  strokeColor = "black",
  bgColor = "transparent"
) => {
  let circle = new Path2D();
  circle.arc(x, y, r, 0, Math.PI * 2, true); // Outer circle
  ctx.lineWidth = strokeThicc;
  ctx.fillStyle = bgColor;
  ctx.fill(circle);
  ctx.strokeStyle = strokeColor;
  ctx.stroke(circle);

  let state = new State(circle, x, y, r);
  if (text) state.addText(ctx, text);

  state.setIsAccepting(ctx, state.isAccepting);

  states.push(state);
  return state;
};

resizeCanvas();
draw();
