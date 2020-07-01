import { Drawing } from "../shapes/drawing.js";
import { registry } from "./serializable.js";
import { Link } from "../shapes/Link.js";
import { StatesLink } from "../shapes/StatesLink.js";
import { State } from "../shapes/state.js";

export interface DrawingsStorage {
  store(drawings: Drawing[]);
  retrive(): Drawing[];
}

const reviver = (k: string, v: any) =>
  typeof v === "object" && "className" in v && v.className in registry
    ? (<any>Object).assign(new registry[v.className](), v)
    : v;

export class LocalStorage implements DrawingsStorage {
  readonly storageName: string;
  readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D, storageName: string) {
    this.ctx = ctx;
    this.storageName = storageName;
  }

  retrive(): Drawing[] {
    let stringFormat = localStorage.getItem(this.storageName);
    if (!stringFormat) return [];
    let drawings = JSON.parse(stringFormat, reviver) as Drawing[];
    //TODO: This is neccessary to restablish references between states and links
    for (let d of drawings) {
      d.ctx = this.ctx;
      if (d instanceof State) {
        let casted = d as State;
        casted.onRetrive(drawings);
      }
    }
    if (drawings) return drawings as Drawing[];
    else return [];
  }

  store(drawings: Drawing[]) {
    let jsonFormat = JSON.stringify(drawings);
    localStorage.setItem(this.storageName, jsonFormat);
  }
}
