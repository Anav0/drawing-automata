export interface IObserver {
  id: string;
  onSubjectUpdated(subject: ISubject);
}

export interface ISubject {
  observers: IObserver[];
  addObserver(observer: IObserver);
  removeObserver(observerId: string);
  notify();
}
