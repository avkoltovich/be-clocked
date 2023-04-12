import { Injectable } from "@angular/core";
import { BehaviorSubject, finalize, map, takeWhile, tap, timer } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class RacersService {
  private timerDelta = 0;
  public currentRacerIndex$ = new BehaviorSubject(0);

  public racers$ = new BehaviorSubject([
    "Константиновский Константин",
    "Eric Idle",
    "Michael Palin",
    "Terry Gilliam",
    "Terry Jones",
    "Graham Chapman"
  ]);

  public raceStartTime = 0;
  public secondsDelta = 30;
  public isRaceStarted$ = new BehaviorSubject(false);
  public isAllMembersStarted$ = new BehaviorSubject(false);

  public timer$ = timer(0, 1000).pipe(
    map(i => this.secondsDelta - i + this.timerDelta),
    tap((value) => {
      if (value === 0) {
        this.timerDelta += this.secondsDelta;
        this.currentRacerIndex$.next(this.currentRacerIndex$.value + 1);
      }
    }),
    takeWhile(() => this.racers$.value.length !== this.currentRacerIndex$.value),
    finalize(() => {
      this.isAllMembersStarted$.next(true);
    })
  );

  constructor() {
  }
}
