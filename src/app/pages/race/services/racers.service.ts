import { Injectable } from "@angular/core";
import { BehaviorSubject, finalize, map, takeWhile, tap, timer } from "rxjs";
import { HttpClient } from "@angular/common/http";

interface IRacers {
  racers: string[];
}

export interface IStarter {
  name: string;
  time: number;
}

@Injectable({
  providedIn: "root"
})
export class RacersService {
  private URL = "../../../../assets/racers.json";
  private timerDelta = 0;
  public currentRacerIndex$ = new BehaviorSubject(0);

  public racers$ = new BehaviorSubject<string[]>([]);
  public finishedRacers: string[] = [];
  public startedRacers: IStarter[] = [];

  public racerSecondsDelta = 5;
  public isRaceStarted$ = new BehaviorSubject(false);
  public isRacePaused$ = new BehaviorSubject(false);
  public isAllMembersStarted$ = new BehaviorSubject(false);

  public timer$ = timer(0, 1000).pipe(
    map(i => this.racerSecondsDelta - i + this.timerDelta),
    tap((value) => {
      if (value === 0) {
        this.startedRacers.push({
          name: this.racers$.value[this.currentRacerIndex$.value],
          time: Date.now()
        });
        console.log(this.startedRacers);
        this.timerDelta += this.racerSecondsDelta;
        this.currentRacerIndex$.next(this.currentRacerIndex$.value + 1);
      }
    }),
    takeWhile((value) => this.racers$.value.length !== this.currentRacerIndex$.value),
    finalize(() => {
      if (this.isRacePaused$.value) {
        this.timerDelta = 0;
      } else {
        this.isAllMembersStarted$.next(true);
      }
    })
  );

  constructor(private httpClient: HttpClient) {
    if (this.checkRacersDataInLS()) {
      this.racers$.next(this.readRacersDataFromLS());
    } else {
      this.updateRacersDataFromJSON();
    }

    this.racers$.pipe(
      tap((value) => {
        this.updateRacersDataInLS(value);
      })
    ).subscribe();
  }

  public updateRacersDataInLS(value: string[]) {
    window.localStorage.setItem("racers", JSON.stringify(value));
  }

  public readRacersDataFromLS() {
    return JSON.parse(window.localStorage.getItem("racers")!);
  }

  public checkRacersDataInLS(): boolean {
    return window.localStorage.getItem("racers") !== null;
  }

  public updateRacersDataFromJSON() {
    this.httpClient.get<IRacers>(this.URL).pipe(
      tap((data: IRacers) => {
        this.racers$.next(data.racers);
      })
    ).subscribe();
  }

  public storeStartTimeInLS(time: number) {
    window.localStorage.setItem("startTime", time.toString());
  }

  public getStartTimeFromLS() {
    const startTime = window.localStorage.getItem("startTime");

    return startTime !== null ? Number.parseInt(startTime) : 0;
  }
}
