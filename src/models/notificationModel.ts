import { Uuid } from "../helpers/uuid.js";

export class NotificationModel {
  readonly id: string;
  public title: string;
  public desc: string;
  public closeAfter: number = 5000;

  private _onClose: () => void;

  set onClose(value: () => void) {
    this._onClose = value;
    setTimeout(() => this._onClose(), this.closeAfter);
  }

  get onClose(): () => void {
    return this._onClose;
  }

  constructor(title: string, desc: string, onClose: () => void = null) {
    this.title = title;
    this.desc = desc;
    this.id = Uuid.uuidv4();
    if (onClose) this.onClose = onClose;
  }
}
