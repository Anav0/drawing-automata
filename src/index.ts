import { State } from "./shapes/state.js";
import { Drawing } from "./shapes/drawing.js";
import { Link } from "./shapes/Link.js";
import { AutomataDrawing } from "./shapes/automataDrawing.js";
import { StatesLink } from "./shapes/StatesLink.js";
import { SelfLink } from "./shapes/selfLink.js";
import notificationManager from "./services/notificationManager.js";
import "./components.js";

import {
  getDrawingsUnderCursor,
  getMousePosOnCanvas,
  snapState,
} from "./helpers/index.js";
import { StartLink } from "./shapes/startLink.js";
import { LocalStorage, DrawingsStorage } from "./helpers/storage.js";
import { Automata } from "./helpers/automata.js";
import { api } from "./api/index.js";
import { MinimizationType } from "./helpers/minimalizationType.js";
import { NotificationModel } from "./models/notificationModel.js";

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
var automata: Automata;
var minimalizationType = MinimizationType.Moore;

const onMouseUp = () => {
  isMouseDown = false;

  if (tmpLink) {
    tmpLink.onMouseUp(getDrawingsUnderCursor(ctx, tmpLink, drawings));
    if (tmpLink.isValid(drawings)) {
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
  document.getElementById("minimizeBtn").addEventListener("click", minimize);
  document
    .getElementById("minimalizationTypeSelector")
    .addEventListener("change", minimalizationTypeChanged);
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

const minimalizationTypeChanged = (event) => {
  minimalizationType = MinimizationType[MinimizationType[event.target.value]];
};

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
  canvas.width = window.innerWidth - 250;
  canvas.height = window.innerHeight - 400;
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

const drawAutomata = (automata: Automata) => {
  const objectFlip = (obj) => {
    const ret = {};
    Object.keys(obj).forEach((key) => {
      ret[obj[key]] = key;
    });
    return ret;
  };

  const createOrRetriveState = (stateIndex, y) => {
    let state;
    if (drawnStates[stateIndex] !== undefined) state = drawnStates[stateIndex];
    else {
      state = new State(
        ctx,
        baseX,
        y,
        Drawing.style.r,
        flipedStatesLookup[stateIndex]
      );
      drawings.push(state);
      drawnStates[stateIndex] = state;
    }

    return state;
  };

  const markAsFinal = (stateIndex: number, state: State) => {
    if (automata.states[stateIndex] === 1) state.isAccepting = true;
  };

  drawings = [];

  let drawnStates = {};

  let midY = canvas.height / 2;
  let baseX = 300;
  let baseY = 100;
  let flipedStatesLookup = objectFlip(automata.statesLookup);
  let flipedSymbolsLookup = objectFlip(automata.symbolsLookup);
  let backAndForthLinks = new Set<string>();
  let drawFromQueque = [];
  for (let key in flipedStatesLookup) {
    drawFromQueque.push(key);
  }
  drawFromQueque.splice(automata.startingState, 1);
  drawFromQueque.push(automata.startingState);

  // Draw start state and its arrow
  let startState = new State(
    ctx,
    baseX,
    baseY,
    Drawing.style.r,
    flipedStatesLookup[automata.startingState]
  );
  markAsFinal(automata["startingState"], startState);
  baseX -= 150;
  drawnStates[automata.startingState] = startState;

  let startLink = new StartLink(ctx, baseX, baseY);
  baseX += 300;
  startLink.endState = startState;
  drawings.push(startState, startLink);
  baseX += 50;

  //Draw the rest of states
  while (drawFromQueque.length > 0) {
    let y = baseY;
    let stateToDrawnFrom = drawFromQueque.pop();
    let statesToDraw = automata.transitions[stateToDrawnFrom];
    let symbolIndex = 0;
    let prevLink: Link;

    for (let stateIndex of statesToDraw) {
      let state = createOrRetriveState(stateIndex, y);
      let drawnFromState = createOrRetriveState(stateToDrawnFrom, y);
      markAsFinal(stateIndex, state);
      markAsFinal(flipedStatesLookup[drawnFromState.text], drawnFromState);

      //Check if its selflink
      if (stateIndex == stateToDrawnFrom) {
        let selfLink;
        if (prevLink && prevLink.endState.id == state.id) selfLink = prevLink;
        else {
          selfLink = new SelfLink(ctx, baseX, y, state);
          drawings.push(selfLink);
        }
        selfLink.text += flipedSymbolsLookup[symbolIndex];
        prevLink = selfLink;
      } else {
        // check if prev link is for the same state
        if (prevLink && prevLink.endState.id === state.id) {
          prevLink.text += flipedSymbolsLookup[symbolIndex];
        } else {
          let link = new StatesLink(ctx, baseX, midY, drawnFromState);

          link.endState = state;
          link.text = flipedSymbolsLookup[symbolIndex];
          drawings.push(link);

          prevLink = link;

          y += 150;

          let key = (state.text + drawnFromState.text)
            .split("")
            .sort()
            .join("");
          backAndForthLinks[key]
            ? backAndForthLinks[key].push(link)
            : (backAndForthLinks[key] = [link]);
        }
      }

      if (baseX > canvas.width) {
        baseX = 100;
        baseY += 100;
      }

      symbolIndex++;
    }
    baseX += 200;
  }

  for (let key in backAndForthLinks) {
    let links = backAndForthLinks[key];
    if (links.length < 2) continue;
    let modi = 1;
    for (let link of links) {
      link.y = link.y + 100;
      link.move(link.x, link.y * modi);
      modi = -1;
    }
  }
  redraw();
};

async function minimize() {
  try {
    notificationManager.clear();
    automata = new Automata(drawings);
    const response = await api.minimize(minimalizationType, automata);
    if (response.status == 400) {
      const apiError = await response.json();
      notificationManager.showNotification(
        new NotificationModel(apiError.title, apiError.desc)
      );
    } else if (response.status == 200) {
      let minimizaedAutomata = (await response.json()) as Automata;
      drawAutomata(minimizaedAutomata);
      notificationManager.showNotification(
        new NotificationModel("Done!", "Automata has been minimized")
      );
    } else if (response.status == 429) {
      notificationManager.showNotification(
        new NotificationModel("Error", "Too many requests")
      );
    } else {
      let text = await response.text();
      notificationManager.showNotification(
        new NotificationModel("Error", text)
      );
    }
  } catch (error) {
    notificationManager.showNotification(
      new NotificationModel("Error", error.message)
    );
  }
}
