import { Injectable } from "@angular/core";
import { BehaviorSubject, finalize, map, takeWhile, tap, timer } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { IFinisher } from "../components/finish-race/finish-race.component";

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
  public finisherNameList: string[] = [];
  public startedRacers: IStarter[] = [];
  public finisherListForSelect: string[] = [];

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
        this.updateStartedRacersInLS(this.startedRacers);
        this.finisherListForSelect.push(this.racers$.value[this.currentRacerIndex$.value]);
        this.updateFinisherListForSelectDataInLS(this.finisherListForSelect);

        this.timerDelta += this.racerSecondsDelta;
        this.currentRacerIndex$.next(this.currentRacerIndex$.value + 1);
        this.updateCurrentRacerIndexInLS(this.currentRacerIndex$.value);
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
    const finisherNameList = this.readFinisherNameListFromLS();
    const startedRacers = this.readStartedRacersFromLS();
    const finisherListForSelect = this.readFinisherListForSelectDataFromLS();
    const currentRacerIndex = this.readCurrentRacerIndexFromLS();

    if (finisherNameList !== null) this.finisherNameList = finisherNameList;
    if (startedRacers !== null) this.startedRacers = startedRacers;
    if (finisherListForSelect !== null) this.finisherListForSelect = finisherListForSelect;
    if (currentRacerIndex !== null) this.currentRacerIndex$.next(currentRacerIndex);

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

  public updateStartedRacersInLS(value: IStarter[]) {
    window.localStorage.setItem("starters", JSON.stringify(value));
  }

  public updateFinisherListForSelectDataInLS(value: string[]) {
    window.localStorage.setItem("finisherListForSelect", JSON.stringify(value));
  }

  public updateFinishersDataInLS(value: IFinisher[]) {
    window.localStorage.setItem("finishers", JSON.stringify(value));
  }

  public updateFinisherNameListInLS(value: string[]) {
    window.localStorage.setItem("finisherNameList", JSON.stringify(value));
  }

  public updateCurrentRacerIndexInLS(value: number) {
    window.localStorage.setItem("currentRacerIndex", JSON.stringify(value));
  }

  public readRacersDataFromLS() {
    return JSON.parse(window.localStorage.getItem("racers")!);
  }

  public readStartedRacersFromLS() {
    return JSON.parse(window.localStorage.getItem("starters")!);
  }

  public readFinisherListForSelectDataFromLS() {
    return JSON.parse(window.localStorage.getItem("finisherListForSelect")!);
  }

  public readCurrentRacerIndexFromLS() {
    return JSON.parse(window.localStorage.getItem("currentRacerIndex")!);
  }

  public readFinishersDataFromLS() {
    return JSON.parse(window.localStorage.getItem("finishers")!);
  }

  public readFinisherNameListFromLS() {
    return JSON.parse(window.localStorage.getItem("finisherNameList")!);
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

  public resetLS() {
    window.localStorage.clear();
  }
}
