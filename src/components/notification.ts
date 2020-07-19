import { LitElement, css, html, property, customElement } from "lit-element";
import { NotificationModel } from "../models/notificationModel";

@customElement("my-notification")
export class NotificationUI extends LitElement {
  static get styles() {
    return css`
      .notification {
        background: white;
        padding: 1rem;
        border: 5px solid black;
        box-shadow: 5px 5px 0px black;
        position: relative;
        min-width: 175px;
      }
      .notification h2 {
        padding-right: 2.5rem;
        margin: 0;
      }
      .notification p {
        margin: 0;
        padding: 0;
      }

      .notification p {
        padding: 1rem 0 0;
        white-space: pre-wrap;
      }
      .notification img {
        background: none;
        border: none;
        font-size: 2rem;
        position: absolute;
        width: 1.25rem;
        height: 1.25rem;
        top: 12px;
        right: 12px;
        place-self: center;
        cursor: pointer;
        transition: transform 0.25s;
      }
      .notification img:hover {
        transform: rotate(90deg);
      }
    `;
  }

  @property({
    type: Object,
  })
  model: NotificationModel = new NotificationModel("", "");

  render() {
    return html`<div class="common-shadow notification">
      <h2>${this.model.title}</h2>
      <p>${this.model.desc}</p>
      <img @click=${this.model.onClose} src="assets/icons/close.svg" />
    </div>`;
  }
}
