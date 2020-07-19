import { MinimizationType } from "../helpers/minimalizationType";
import { Automata } from "../helpers/automata";

const url = "http://127.0.0.1:5000";

class Api {
  minimize(type: MinimizationType, automata: Automata) {
    return fetch(`${url}/minimize`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        automata,
      }),
    });
  }
}

export const api = new Api();
