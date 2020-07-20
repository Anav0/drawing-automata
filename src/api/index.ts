import { MinimizationType } from "../helpers/minimalizationType";
import { Automata } from "../helpers/automata";

//TODO: move to enviroment variable
const url = "https://automata-server-oepzwdr6xa-ew.a.run.app";

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
