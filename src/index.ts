import { State } from "./shapes/state.js";
import { Drawing } from "./shapes/drawing.js";
import { Link } from "./shapes/Link.js";
import { AutomataDrawing } from "./shapes/automataDrawing.js";
import { StatesLink } from "./shapes/StatesLink.js";
import { SelfLink } from "./shapes/selfLink.js";

import {
  getDrawingsUnderCursor,
  getMousePosOnCanvas,
  snapState,
} from "./helpers/index.js";
import { StartLink } from "./shapes/startLink.js";
import { LocalStorage, DrawingsStorage } from "./helpers/storage.js";

var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;
var isMouseDown = false;
var isShiftPressed = false;
var drawings: Drawing[] = [];
var input = "";
var tmpLink: Link;
var movingDrawing: Drawing;
var storage: DrawingsStorage;
var isStartStatePresent: boolean;

const onMouseUp = () => {
  isMouseDown = false;

  if (tmpLink) {
    tmpLink.onMouseUp(getDrawingsUnderCursor(ctx, tmpLink, drawings));
    if (tmpLink.isValid()) {
      drawings.push(tmpLink);
      tmpLink = null;
      setHighlightedDrawing(drawings[drawings.length - 1]);
    }
  }
  movingDrawing = null;
  tmpLink = null;
  redraw();
};

const onMouseDown = () => {
  isMouseDown = true;
  const mousePos = getMousePosOnCanvas(canvas);
  const drawingUnderCursor = getDrawingsUnderCursor(ctx, tmpLink, drawings)[0];

  if (!drawingUnderCursor && getHighlightedDrawing()) {
    unhighlightDrawings();
    return;
  }

  if (isShiftPressed) {
    let link;
    if (!drawingUnderCursor && !isStartStatePresent) {
      link = new StartLink(ctx, mousePos.x, mousePos.y);
      isStartStatePresent = true;
    } else
      link = new StatesLink(
        ctx,
        mousePos.x,
        mousePos.y,
        drawingUnderCursor as State
      );
    movingDrawing = tmpLink = link.draw();
    return;
  } else if (drawingUnderCursor) {
    setHighlightedDrawing(drawingUnderCursor);
    movingDrawing = drawingUnderCursor;
    return;
  }
  let newState = new State(ctx, mousePos.x, mousePos.y).draw();
  drawings.push(newState);
  setHighlightedDrawing(newState);
};

const onMouseMove = () => {
  if (!isMouseDown || !movingDrawing) return;
  const mousePos = getMousePosOnCanvas(canvas);
  if (tmpLink && isShiftPressed) {
    switchLinkVariant(mousePos);
    movingDrawing = tmpLink;
  }
  movingDrawing.move(mousePos.x, mousePos.y);
  if (movingDrawing instanceof State)
    snapState(movingDrawing as State, drawings);
  redraw();
};

const onDbClick = () => {
  let drawing = getDrawingsUnderCursor(ctx, tmpLink, drawings)[0];
  drawing.onDbClick();
  redraw();
};

const onKeyDown = (event) => {
  if (event.key.toLowerCase() == "backspace") {
    input = input.slice(0, -1);
  } else if (event.key.toLowerCase() == "delete") {
    const drawing = getHighlightedDrawing();
    drawings = drawing.delete(drawings);
    drawings.splice(drawings.indexOf(drawing), 1);
    determinStartStatePresence();
    redraw();
  } else if (event.key.toLowerCase() == "shift") {
    isShiftPressed = true;
  } else {
    if (event.key.length === 1) input += event.key;
  }

  let hightlightedState = getHighlightedDrawing();
  if (hightlightedState) {
    clearCanvas();
    hightlightedState.text = input;
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

const onLoad = () => {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  storage = new LocalStorage(ctx, "drawings");
  drawings = storage.retrive();

  determinStartStatePresence();

  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("dblclick", onDbClick);

  resizeCanvas();
  draw();
};

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("resize", onResize);
window.addEventListener("load", onLoad);

const determinStartStatePresence = () => {
  isStartStatePresent = false;
  for (let drawing of drawings) {
    if (drawing instanceof StartLink) {
      isStartStatePresent = true;
      return;
    }
  }
};

const resizeCanvas = () => {
  canvas.width = window.innerWidth - 150;
  canvas.height = window.innerHeight - 200;
};

const draw = () => {
  drawings.map((drawing) => drawing.draw());
  if (tmpLink) tmpLink.draw();

  storage.store(drawings);
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const redraw = () => {
  clearCanvas();
  draw();
};

const switchLinkVariant = (mousePos) => {
  const drawingUnderCursor = getDrawingsUnderCursor(ctx, tmpLink, drawings)[0];

  let targetDrawing = drawingUnderCursor as State;

  let startDrawing;
  if (tmpLink instanceof SelfLink) startDrawing = tmpLink.endState;
  else if (tmpLink instanceof StatesLink) startDrawing = tmpLink.startState;

  if (targetDrawing && startDrawing && targetDrawing.id == startDrawing.id) {
    tmpLink = new SelfLink(ctx, mousePos.x, mousePos.y, targetDrawing);
  } else if (startDrawing) {
    tmpLink = new StatesLink(ctx, mousePos.x, mousePos.y, startDrawing);
  }
};

const getHighlightedDrawing = () => {
  for (let drawing of drawings) {
    let automataDrawing = drawing as AutomataDrawing;
    if (automataDrawing.isHighlighted) return automataDrawing;
  }
};

const unhighlightDrawings = () => {
  const automataDrawings = drawings.map(
    (drawing) => drawing as AutomataDrawing
  );
  if (tmpLink) automataDrawings.push(tmpLink);

  for (let automataDrawing of automataDrawings) {
    automataDrawing.drawHighlight(false);
  }
};

const setHighlightedDrawing = (drawing: Drawing) => {
  unhighlightDrawings();
  let casted = drawing as AutomataDrawing;
  casted.drawHighlight(true);
  input = casted.text;
};
