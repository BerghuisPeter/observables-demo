import { Component } from '@angular/core';
import { concat, concatMap, delay, forkJoin, from, map, merge, mergeMap, Observable, switchMap, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Post } from "./models/post.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  normalCall$: Observable<any>;
  tapCall$: Observable<any>;
  mapCall$: Observable<any>;
  concatMapCall$: Observable<any>;
  concatCall$: Observable<any>;
  mergeCall$: Observable<any>;
  mergeMapCall$: Observable<any>;
  switchMapCall$: Observable<any>;
  forkJoinCall$: Observable<any>;

  numberOfPosts: number = 0;

  constructor(private httpClient: HttpClient) {
    this.normalCall$ = this.getNormalCall();
    this.tapCall$ = this.getTapCall();
    this.mapCall$ = this.getMapCall();
    this.concatCall$ = this.getConcatCall();
    this.concatMapCall$ = this.getConcatMapCall();
    this.mergeCall$ = this.getMergeCall();
    this.mergeMapCall$ = this.getMergeMapCall();
    this.switchMapCall$ = this.getSwitchMapCall();
    this.forkJoinCall$ = this.getForkJoinCall();
  }

  /**
   * Just a normal http call for a list of posts made by user with ID = 1.
   * @private
   */
  private getNormalCall(): Observable<Post[]> {
    return this.httpClient.get<Post[]>('https://jsonplaceholder.typicode.com/users/1/posts');
  }

  /**
   * Do something before completing the observable.
   * Here it initialises the numberOfItems by getting the value of the lis length.
   * tap cannot change the returned value.
   * @private
   */
  private getTapCall(): Observable<Post[]> {
    return this.normalCall$.pipe(
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
  private getMapCall(): Observable<Post[]> {
    return this.normalCall$.pipe(
      map(posts => posts.slice(0, 3))
    );
  }

  /**
   * Execute all observables one after the other in sequence and emits results of each.
   * @private
   */
  private getConcatCall(): Observable<any> {
    const call1 = this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/2');
    const call2 = this.httpClient.get<Post[]>('https://jsonplaceholder.typicode.com/users/2/posts');
    const call3 = this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/2/albums');

    return concat(call1, call2, call3);
  }

  /**
   * Each time the source observable emits, execute inner observable and emit its result instead of the source observable before executing the next
   * this simply means, instead of emitting the source value, execute another (inner observable) and return emit its value! hench the concatMAP
   * @private
   */
  private getConcatMapCall(): Observable<any> {
    // comment IDs to get
    const commentIdsToGet = [1, 2, 3];

    return from(commentIdsToGet).pipe(
      concatMap((commentId: number) =>
        this.httpClient.get<any>('https://jsonplaceholder.typicode.com/comments/' + commentId)
          .pipe(
            delay(700)
          )
      )
    );
  }

  /**
   * Execute all observables concurrently and emits results of each in the order of when they finish (no particular order to be clear).
   * @private
   */
  private getMergeCall(): Observable<any> {
    const call1 = this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/2');
    const call2 = this.httpClient.get<Post[]>('https://jsonplaceholder.typicode.com/users/2/posts');
    const call3 = this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/2/albums');

    return merge(call1, call2, call3);
  }

  /**
   * Each time the source observable emits, execute inner observable and emit its result instead of the source observable when one completes in no particular order.
   * this simply means, instead of emitting the source value, execute another (inner observable) and return emit its value! hench the mergeMAP
   * @private
   */
  private getMergeMapCall(): Observable<any> {
    // comment IDs to get
    const commentIdsToGet = [1, 2, 3];

    return from(commentIdsToGet).pipe(
      mergeMap((commentId: number) =>
        this.httpClient.get<any>('https://jsonplaceholder.typicode.com/comments/' + commentId)
          .pipe(
            delay(700)
          )
      )
    );
  }

  /**
   * Identical to mergeMap except that it stops listening to the previous inner observable if the source emits a new value
   * and the previous inner observable hasn't emit a value yet (to be clear, if inner call not done yet).
   * @private
   */
  private getSwitchMapCall(): Observable<any> {
    return this.httpClient.get<Post>('https://jsonplaceholder.typicode.com/posts/3').pipe(
      switchMap((post: Post) =>
        this.httpClient.get('https://jsonplaceholder.typicode.com/users/' + post.userId)
      )
    );
  }

  /**
   * Fires both inner observables at the same time but only completes once both inner observables have completed.
   * @private
   */
  private getForkJoinCall(): Observable<any> {
    const listOfCallsToMake = [
      this.httpClient.get<Post[]>('https://jsonplaceholder.typicode.com/users/2/posts'),
      this.httpClient.get<any>('https://jsonplaceholder.typicode.com/users/2').pipe(delay(3000))
    ];
    return forkJoin(listOfCallsToMake);
  }

}
