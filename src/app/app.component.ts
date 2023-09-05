import { Component } from '@angular/core';
import {
  catchError,
  concat,
  concatMap,
  defer,
  delay,
  forkJoin,
  from,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  retry,
  switchMap,
  tap
} from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Post } from "./models/post.model";
import { OBSERVABLE_ENUM } from "./models/observable.enum";
import { LogService } from "./services/log.service";
import { CallSequence } from "./models/call-sequence.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public enumList: OBSERVABLE_ENUM[];

  public currentObservable$: Observable<any>;
  public currentEnum: OBSERVABLE_ENUM;
  public callSequence: CallSequence[];

  numberOfPosts: number = 0;

  constructor(private httpClient: HttpClient, public logService: LogService) {
    this.enumList = Object.values(OBSERVABLE_ENUM);
    this.callSequence = [];
    this.currentObservable$ = this.getNormal();
    this.currentEnum = OBSERVABLE_ENUM.normal;
  }

  changeContent(enumKey: any) {
    this.callSequence = [];
    this.logService.clearLogs();
    this.currentEnum = enumKey;
    switch (enumKey) {
      case OBSERVABLE_ENUM.normal:
        this.currentObservable$ = this.getNormal();
        break;
      case OBSERVABLE_ENUM.tap:
        this.currentObservable$ = this.getTap();
        break;
      case OBSERVABLE_ENUM.map:
        this.currentObservable$ = this.getMap();
        break;
      case OBSERVABLE_ENUM.concat:
        this.currentObservable$ = this.getConcat();
        break;
      case OBSERVABLE_ENUM.concatMap:
        this.currentObservable$ = this.getConcatMap();
        break;
      case OBSERVABLE_ENUM.merge:
        this.currentObservable$ = this.getMerge();
        break;
      case OBSERVABLE_ENUM.mergeMap:
        this.currentObservable$ = this.getMergeMap();
        break;
      case OBSERVABLE_ENUM.switchMap:
        this.currentObservable$ = this.getSwitchMap();
        break;
      case OBSERVABLE_ENUM.forkJoin:
        this.currentObservable$ = this.getForkJoin();
        break;
      case OBSERVABLE_ENUM.retry:
        this.currentObservable$ = this.getRetry();
        break;
      case OBSERVABLE_ENUM.catchError:
        this.currentObservable$ = this.getCatchError();
        break;
    }
  }

  private sequenceObserver(observable: Observable<any>): Observable<any> {
    const myCallSequence: CallSequence = new CallSequence(`call${this.callSequence.length + 1}`);
    this.callSequence.push(myCallSequence);

    return defer(() => {
      myCallSequence.status = 'loading';
      return observable
        .pipe(
          delay(1000),
          catchError(error => {
            myCallSequence.status = 'error';
            throw error;
          }),
          tap(() => myCallSequence.status = 'done')
        )
    });
  };

  /**
   * Just a normal http call for a list of posts made by user with ID = 1.
   * @private
   */
  private getNormal(): Observable<Post[]> {
    return this.sequenceObserver(
      this.httpClient.get<Post[]>('https://jsonplaceholder.typicode.com/users/1/posts')
    );
  }

  /**
   * Do something before completing the observable.
   * Here it initialises the numberOfItems by getting the value of the list length.
   * tap cannot change the returned value.
   * @private
   */
  private getTap(): Observable<Post[]> {
    return this.getNormal().pipe(
      tap(posts => {
        this.numberOfPosts = posts.length;
      })
    );
  }

  /**
   * Modify each emitted value before emitting.
   * Here it modifies the list to return only the first 3 items
   * @private
   */
  private getMap(): Observable<Post[]> {
    return this.getNormal().pipe(
      map(posts => posts.slice(0, 3))
    );
  }

  /**
   * Execute all observables one after the other in sequence and emits results of each.
   * Please note that concat will never complete if some of the input streams don’t complete. This also means that some streams will never be subscribed to.
   * @private
   */
  private getConcat(): Observable<any> {
    const call1 = this.sequenceObserver(this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/2'));
    const call2 = this.sequenceObserver(this.httpClient.get<Post[]>('https://jsonplaceholder.typicode.com/users/2/posts'));
    const call3 = this.sequenceObserver(this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/2/albums'));

    return concat(call1, call2, call3);
  }

  /**
   * Each time the source observable emits, execute inner observable and emit its result instead of the source observable before executing the next
   * this simply means, instead of emitting the source value, execute another (inner observable) and return emit its value! hench the concatMAP
   * @private
   */
  private getConcatMap(): Observable<any> {
    // comment IDs to get
    const commentIdsToGet = [1, 2, 3];

    return from(commentIdsToGet).pipe(
      concatMap((commentId: number) =>
        this.sequenceObserver(this.httpClient.get<any>('https://jsonplaceholder.typicode.com/comments/' + commentId))
      )
    );
  }

  /**
   * Execute all observables concurrently and emits results of each in the order of when they finish (no particular order to be clear).
   * @private
   */
  private getMerge(): Observable<any> {
    const call1 = this.sequenceObserver(this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/2'));
    const call2 = this.sequenceObserver(this.httpClient.get<Post[]>('https://jsonplaceholder.typicode.com/users/2/posts'));
    const call3 = this.sequenceObserver(this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/2/albums'));

    return merge(call1, call2, call3);
  }

  /**
   * Each time the source observable emits, execute inner observable and emit its result instead of the source observable when one completes in no particular order.
   * This simply means, instead of emitting the source value, execute another (inner observable) and return emit its value! hench the mergeMAP
   * @private
   */
  private getMergeMap(): Observable<any> {
    // comment IDs to get
    const commentIdsToGet = [1, 2, 3];

    return from(commentIdsToGet).pipe(
      mergeMap((commentId: number) =>
        this.sequenceObserver(this.httpClient.get<any>('https://jsonplaceholder.typicode.com/comments/' + commentId))
      )
    );
  }

  /**
   * Identical to mergeMap except that it stops listening to the previous inner observable if the source emits a new value
   * and the previous inner observable hasn't emit a value yet (to be clear, if inner call not done yet).
   * @private
   */
  private getSwitchMap(): Observable<any> {
    return this.sequenceObserver(this.httpClient.get<Post>('https://jsonplaceholder.typicode.com/posts/3')).pipe(
      switchMap((post: Post) =>
        this.sequenceObserver(this.httpClient.get('https://jsonplaceholder.typicode.com/users/' + post.userId))
      )
    );
  }

  /**
   * Fires both inner observables at the same time but only completes once both inner observables have completed.
   * @private
   */
  private getForkJoin(): Observable<any> {
    const listOfCallsToMake = [
      this.sequenceObserver(this.httpClient.get<Post[]>('https://jsonplaceholder.typicode.com/users/2/posts')),
      this.sequenceObserver(this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/2')).pipe(delay(2000))
    ];
    return forkJoin(listOfCallsToMake);
  }

  /**
   * Retry can be used to retry a failed network request.
   * @private
   */
  private getRetry(): Observable<any> {
    return this.sequenceObserver(this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/5000')).pipe(
      retry({ count: 2, delay: 2000 })
    );
  }

  /**
   * catch an error
   * @private
   */
  private getCatchError(): Observable<any> {
    const call1 = this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/2');
    const callWithErrorButCaught = this.httpClient.get<Post[]>('https://jsonplaceholder.typicode.com/users/5000').pipe(
      catchError(error => {
        // You can log the error or perform other actions here
        console.error(`Error Code: ${error.status}\nMessage: ${error.message}`);
        // Pass the error along the Observable chain to cause error to be triggered or return fake data
        // return throwError(() => new Error('Error Caught!'));
        return of([]);
      })
    );
    return forkJoin([call1, callWithErrorButCaught]);
  }

}
