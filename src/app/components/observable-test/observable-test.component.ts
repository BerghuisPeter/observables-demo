import { Component, Input } from '@angular/core';
import { Observable } from "rxjs";
import { OBSERVABLE_ENUM } from "../../models/observable.enum";
import { LogService } from "../../services/log.service";

@Component({
  selector: 'app-observable-test',
  templateUrl: './observable-test.component.html',
  styleUrls: ['./observable-test.component.css']
})
export class ObservableTestComponent {

  @Input() observableCall?: Observable<any>;
  public title: string = '';
  public description: string = '';
  public subDescription: string = '';
  public function: string = '';

  constructor(private logService: LogService) {
  }

  @Input() set observableEnum(observableEnum: OBSERVABLE_ENUM) {
    this.setContent(observableEnum);
  };

  /**
   * execute the observable and log emitted value(s)
   */
  public executeCall(): void {
    this.observableCall?.subscribe(
      v => this.logService.log('Emitted value: ', v),
      error => console.log(error)
    );
  }

  private setContent(enumKey: OBSERVABLE_ENUM): void {
    this.title = enumKey;
    switch (enumKey) {
      case OBSERVABLE_ENUM.normal:
        this.description = `Normal http call.`;
        this.subDescription = ``;
        this.function = `\n  return this.httpClient.get<Post[]>('https://domain.com/users/1/posts');`;
        break;
      case OBSERVABLE_ENUM.tap:
        this.description = `Do something before completing the observable.`;
        this.subDescription = `Here it initialises the numberOfItems by getting the value of the list length. \nTap cannot change the returned value.`;
        this.function = `\n    return this.getNormal().pipe(
      tap(posts => {
        this.numberOfPosts = posts.length;
      })
    );`;
        break;
      case OBSERVABLE_ENUM.map:
        this.description = `Modify each emitted value before emitting.`;
        this.subDescription = `Here it modifies the list to return only the first 3 items`;
        this.function = `\n    return this.getNormal().pipe(
      map(posts => posts.slice(0, 3))
    );`;
        break;
      case OBSERVABLE_ENUM.concat:
        this.description = `Execute all observables one after the other in sequence and emits results of each.`;
        this.subDescription = `Please note that concat will never complete if some of the input streams don’t complete. This also means that some streams will never be subscribed to.`;
        this.function = `\n    const call1 = this.httpClient.get<any>('https://domain.com/users/2');
    const call2 = this.httpClient.get<Post[]>('https://domain.com/users/2/posts');
    const call3 = this.httpClient.get<any>('https://domain.com/users/2/albums');

    return concat(call1, call2, call3);`;
        break;
      case OBSERVABLE_ENUM.concatMap:
        this.description = `Each time the source observable emits, execute inner observable and emit its result instead of the source observable before executing the next this simply means, instead of emitting the source value, execute another (inner observable) and return emit its value! hench the concatMAP`;
        this.subDescription = ``;
        this.function = `\n    // comment IDs to get
    const commentIdsToGet = [1, 2, 3];

    return from(commentIdsToGet).pipe(
      concatMap((commentId: number) =>
        this.httpClient.get<any>('https://domain.com/comments/' + commentId)
          .pipe(
            delay(700)
          )
      )
    );`;
        break;
      case OBSERVABLE_ENUM.merge:
        this.description = `Execute all observables concurrently and emits results of each in the order of when they finish (no particular order to be clear).`;
        this.subDescription = ``;
        this.function = `\n    const call1 = this.httpClient.get<any>('https://domain.com/users/2');
    const call2 = this.httpClient.get<Post[]>('https://domain.com/users/2/posts');
    const call3 = this.httpClient.get<any>('https://domain.com/users/2/albums');

    return merge(call1, call2, call3);`;
        break;
      case OBSERVABLE_ENUM.mergeMap:
        this.description = ` Each time the source observable emits, execute inner observable and emit its result instead of the source observable when one completes in no particular order.`;
        this.subDescription = `This simply means, instead of emitting the source value, execute another (inner observable) and return emit its value! hench the mergeMAP`;
        this.function = `\n    // comment IDs to get
    const commentIdsToGet = [1, 2, 3];

    return from(commentIdsToGet).pipe(
      mergeMap((commentId: number) =>
        this.httpClient.get<any>('https://domain.com/comments/' + commentId)
      )
    );`;
        break;
      case OBSERVABLE_ENUM.switchMap:
        this.description = `Identical to mergeMap except that it stops listening to the previous inner observable if the source emits a new value and the previous inner observable hasn't emit a value yet (to be clear, if inner call not done yet).`;
        this.subDescription = ``;
        this.function = `\n    return this.httpClient.get<Post>('https://domain.com/posts/3').pipe(
      switchMap((post: Post) =>
        this.httpClient.get('https://domain.com/users/' + post.userId)
      )
    );`;
        break;
      case OBSERVABLE_ENUM.forkJoin:
        this.description = `Fires both inner observables at the same time but only completes once both inner observables have completed.`;
        this.subDescription = ``;
        this.function = `\n    const listOfCallsToMake = [
      this.httpClient.get<Post[]>('https://domain.com/users/2/posts'),
      this.httpClient.get<any>('https://domain.com/users/2').pipe(delay(3000))
    ];
    return forkJoin(listOfCallsToMake);`;
        break;
      case OBSERVABLE_ENUM.retry:
        this.description = `Retry can be used to retry a failed network request.`;
        this.subDescription = ``;
        this.function = `\n    return this.httpClient.get<any>('https://domain.com/users/5000').pipe(
      retry({ count: 2, delay: 1000 })
    );`;
        break;
      case OBSERVABLE_ENUM.catchError:
        this.description = `catch an error.`;
        this.subDescription = ``;
        this.function = `\n    const call1 = this.httpClient.get<any>('https://domain.com/users/2');
    const callWithErrorButCaught = this.httpClient.get<Post[]>('https://domain.com/users/5000').pipe(
      catchError(error => {
        // You can log the error or perform other actions here
        console.error('Error Code: error.status Message: error.message');
        // Pass the error along the Observable chain to cause error to be triggered or return fake data
        // return throwError(() => new Error('Error Caught!'));
        return of([]);
      })
    );
    return forkJoin([call1, callWithErrorButCaught]);`;
        break;
    }
  }
}
