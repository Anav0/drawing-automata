import { Drawing } from "../shapes/drawing.js";
import { State } from "../shapes/state.js";
import { StartLink } from "../shapes/startLink.js";
import { SelfLink } from "../shapes/selfLink.js";
import { StatesLink } from "../shapes/StatesLink.js";

export class Automata {
  // index of start state
  startingState: number;
  // 1 means final state, 0 means normal. Index is a state
  states: number[] = [];
  transitions: number[][] = [];
  symbolsLookup: Set<string>;
  statesLookup: Set<string>;

  constructor(drawings: Drawing[]) {
    this.symbolsLookup = new Set();
    this.statesLookup = new Set();
    let symbolIndexCounter = 0;

    for (let drawing of drawings) {
      if (drawing instanceof State) {
        let casted = drawing as State;
        let sanitizedName = casted.text.trim();
        let isFinal = casted.isAccepting ? 1 : 0;
        let index = this.states.push(isFinal) - 1;
        this.statesLookup[sanitizedName] = index;
        this.transitions[index] = [];
      }
    }
    for (let drawing of drawings) {
      if (drawing instanceof StartLink) {
        let casted = drawing as StartLink;
        let sanitizedName = casted.endState.text.trim();
        this.startingState = this.statesLookup[sanitizedName];
      } else if (drawing instanceof SelfLink) {
        let casted = drawing as SelfLink;
        let sanitizedName = casted.endState.text.trim();
        let symbols = casted.text.trim().split("");
        let index = this.statesLookup[sanitizedName];

        for (let symbol of symbols) {
          let symbolIndex = this.symbolsLookup[symbol];
          if (symbolIndex === undefined) {
            symbolIndex = this.symbolsLookup[symbol] = symbolIndexCounter;
            symbolIndexCounter++;
          }
          if (this.transitions[index][symbolIndex] >= 0)
            throw new Error(
              `State: ${sanitizedName} has same symbol in different arrows`
            );
          this.transitions[index][symbolIndex] = index;
        }
      } else if (drawing instanceof StatesLink) {
        let casted = drawing as StatesLink;
        let sanitizedNameA = casted.startState.text.trim();
        let sanitizedNameB = casted.endState.text.trim();
        let indexA = this.statesLookup[sanitizedNameA];
        let indexB = this.statesLookup[sanitizedNameB];
        let symbols = casted.text.trim().split("");

        for (let symbol of symbols) {
          let symbolIndex = this.symbolsLookup[symbol];
          if (symbolIndex === undefined) {
            symbolIndex = this.symbolsLookup[symbol] = symbolIndexCounter;
            symbolIndexCounter++;
          }

          if (this.transitions[indexA][symbolIndex] >= 0)
            throw new Error(
              `State: ${sanitizedNameA} has same symbol in different arrows`
            );
          this.transitions[indexA][symbolIndex] = indexB;
        }
      }
    }
  }
}
