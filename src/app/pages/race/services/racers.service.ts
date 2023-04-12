import { Injectable } from "@angular/core";
import { BehaviorSubject, finalize, map, takeWhile, tap, timer } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class RacersService {
  private timerDelta = 0;

  public registeredRacers$ = new BehaviorSubject([
    "Константиновский Константин",
    "Eric Idle",
    "Michael Palin",
    "Terry Gilliam",
    "Terry Jones",
    "Graham Chapman"
  ]);

  public startedRacers$ = new BehaviorSubject([]);
  public finishedRacers$ = new BehaviorSubject([]);
  public raceStartTime = 0;
  public isRaceStarted$ = new BehaviorSubject(false);
  public isAllMembersStarted$ = new BehaviorSubject(false);

  public timer$ = timer(0, 1000).pipe(
    map(i => 30 - i + this.timerDelta),
    tap((value) => {
      if (value === 0) {
        this.timerDelta += 30;
        const currentList = this.registeredRacers$.value.slice(1);
        this.registeredRacers$.next(currentList);
      }
    }),
    takeWhile(() => this.registeredRacers$.value.length > 0),
    finalize(() => {
      this.isAllMembersStarted$.next(true);
    })
  );

  constructor() {
  }
}
