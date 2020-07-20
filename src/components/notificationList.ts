import { LitElement, html, css, property, customElement } from "lit-element";
import { NotificationModel } from "../models/notificationModel";
import { IObserver, ISubject } from "../services/observerPattern";
import { Uuid } from "../helpers/uuid";
import notifcationManager, {
  NotificationManager,
} from "../services/notificationManager";

@customElement("my-notifications")
export class NotificationsList extends LitElement implements IObserver {
  id: string;

  constructor() {
    super();
    this.id = Uuid.uuidv4();

    notifcationManager.addObserver(this);
  }

  static get styles() {
    return css`
      .notification-list {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        position: absolute;
        top: 2%;
        right: 2%;
      }

      .notification-list > * {
        margin-top: 1rem;
      }
    `;
  }

  @property()
  private notifications: NotificationModel[] = [];

  removeNotification(modelId: string) {
    notifcationManager.removeNotification(modelId);
  }

  onSubjectUpdated(subject: ISubject) {
    let casted = subject as NotificationManager;
    this.notifications = [...casted.notifications];
  }

  disconnectedCallback() {
    notifcationManager.removeObserver(this.id);
  }

  render() {
    let notificationsUI = [];

    for (let model of this.notifications) {
      model.onClose = () => this.removeNotification(model.id);

      notificationsUI.push(
        html`<my-notification .model=${model}></my-notification>`
      );
    }

    return html`
      <div class="notification-list">
        ${notificationsUI.map((UIElement) => UIElement)}
      </div>
    `;
  }
}
