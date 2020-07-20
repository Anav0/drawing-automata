import { NotificationModel } from "../models/notificationModel";
import { ISubject, IObserver } from "./observerPattern";

export class NotificationManager implements ISubject {
  private _notifications: NotificationModel[] = [];

  get notifications(): NotificationModel[] {
    return this._notifications;
  }

  public showNotification(model: NotificationModel) {
    this._notifications.push(model);
    this.notify();
  }

  public removeNotification(modelId: string) {
    this._notifications = this.notifications.filter((x) => x.id !== modelId);
    this.notify();
  }

  public clear() {
    this._notifications = [];
    this.notify();
  }

  /* #### OBSERVER PATTERN ##### */

  observers: IObserver[] = [];

  addObserver(observer: IObserver) {
    this.observers.push(observer);
  }

  removeObserver(observerId: string) {
    this.observers = this.observers.filter((x) => x.id !== observerId);
  }

  notify() {
    this.observers.forEach((observer) => observer.onSubjectUpdated(this));
  }
}

const instance = new NotificationManager();

export default instance;
