import { Component, Input } from '@angular/core';
import { Observable } from "rxjs";
import { CallSequence } from "../../models/call-sequence.model";

@Component({
  selector: 'app-observable-test',
  templateUrl: './observable-test.component.html',
  styleUrls: ['./observable-test.component.css']
})
export class ObservableTestComponent {

  @Input()
  title: string = '';

  @Input()
  text?: string = '';

  @Input()
  observableCall?: Observable<any>;

  @Input()
  callSequence?: CallSequence;

  public executeCall() {
    this.observableCall?.subscribe(v => console.log('Final Result: ', v));
  }
}
