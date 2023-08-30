import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private logs: string[] = [];
  private logSubject = new BehaviorSubject<string[]>([]);

  log(message: string, obj: Object) {
    this.logs.push(message + JSON.stringify(obj));
    this.logSubject.next([...this.logs]);
    console.log(message, obj);
  }

  getLogs(): BehaviorSubject<string[]> {
    return this.logSubject;
  }

  clearLogs() {
    this.logs = [];
    this.logSubject.next([]);
  }
}
