import { State } from "./state.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var isMovingShape = false;
var states = [];
var input = "";
const onResize = () => {
  resizeCanvas();
  clearCanvas();
  draw();
};

const getMousePosOnCanvas = () => {
  let rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
};

const onMouseDown = (event) => {
  const stateUnderCursor = getStateUnderCursor(ctx);

  if (stateUnderCursor) {
    isMovingShape = true;
    return;
  }

  const mousePos = getMousePosOnCanvas();
  states.push(new State(ctx, mousePos.x, mousePos.y).draw());
};

const getStateUnderCursor = (ctx) => {
  const mousePos = getMousePosOnCanvas();
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
  const mousePos = getMousePosOnCanvas();

  let state = getStateUnderCursor(ctx);
  state.x = mousePos.x;
  state.y = mousePos.y;

  clearCanvas();
  draw();
};

const onDbClick = (event) => {
  let state = getStateUnderCursor(ctx);
  state.setIsAccepting(!state.isAccepting);
  clearCanvas();
  draw();
};

const onClick = (event) => {
  const mousePos = getMousePosOnCanvas();

  for (let state of states) {
    if (ctx.isPointInPath(state.shape, mousePos.x, mousePos.y)) {
      state.setHightLight(true);
      input = state.text;
    } else state.setHightLight(false);
  }

  clearCanvas();
  draw();
};

const getHighlightedState = () => {
  for (let state of states) {
    if (state.isHighlighted) return state;
  }
};

const onKeyDown = async (event) => {
  if (event.key.toLowerCase() == "backspace") {
    input = input.slice(0, -1);
  } else if (event.key.toLowerCase() == "delete") {
    states.splice(states.indexOf(getHighlightedState()), 1);
    clearCanvas();
    draw();
  } else {
    input += String.fromCharCode(event.keyCode);
  }

  let hightlightedState = getHighlightedState();
  if (hightlightedState) {
    clearCanvas();
    hightlightedState.drawText(input);
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
    let newState = new State(ctx, state.x, state.y, state.r, state.text);
    newState.isAccepting = state.isAccepting;
    newState.isHighlighted = state.isHighlighted;
    newState.draw();
    states.push(newState);
  }
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

resizeCanvas();
draw();
