import { Injectable } from "@angular/core";
import { BehaviorSubject, finalize, map, takeWhile, tap, timer } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { IFinishCategory, IFinisher } from "../containers/finish-race/finish-race.component";

export interface IRacer {
  name: string;
  category: string;
  number: number;
  startNumber?: number;
}

export interface IStarter {
  name: string;
  time: number;
}

export interface ISyncJSON {
  name: string;
  racers: string[];
  categoriesMap: Record<string, string[]>;
  starters: IStarter[];
  starterNameList: string[];
  currentRacerIndex: number;
  currentAnonIndex: number;
  finishers: IFinisher[];
  finishersByCategories: IFinishCategory[];
  anons: IFinisher[];
  finisherNameList: string[];
}

@Injectable({
  providedIn: "root"
})
export class RacersService {
  private URL = "../../../../assets/racers.json";
  private URL_SYNC_JSON = "../../../../assets/sync-data.json";
  private timerDelta = 0;
  public currentRacerIndex$ = new BehaviorSubject(0);

  public racers$ = new BehaviorSubject<IRacer[]>([]);
  public finisherNameList: string[] = [];
  public startedRacers: IStarter[] = [];
  public starterNameList: string[] = [];
  public categoriesMap$ = new BehaviorSubject<Record<string, IRacer[]>>({});

  public racerSecondsDelta = 30;
  public isRaceStarted$ = new BehaviorSubject(false);
  public isRacePaused$ = new BehaviorSubject(false);
  public isAllMembersStarted$ = new BehaviorSubject(false);

  public timer$ = timer(0, 1000).pipe(
    map(i => this.racerSecondsDelta - i + this.timerDelta),
    tap((value) => {
      if (value === 0) {
        this.startedRacers.push({
          name: this.racers$.value[this.currentRacerIndex$.value].name,
          time: Date.now()
        });
        this.updateStartedRacersInLS(this.startedRacers);
        this.starterNameList.push(this.racers$.value[this.currentRacerIndex$.value].name);
        this.updateStarterNameListInLS(this.starterNameList);

        this.timerDelta += this.racerSecondsDelta;
        this.currentRacerIndex$.next(this.currentRacerIndex$.value + 1);
        this.updateCurrentRacerIndexInLS(this.currentRacerIndex$.value);
        console.log(this.collectDataFromLS());
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
    const starterNameList = this.readStarterNameListFromLS();
    const currentRacerIndex = this.readCurrentRacerIndexFromLS();
    const categoriesMap = this.readCategoriesMapFromLS();

    if (finisherNameList !== null) this.finisherNameList = finisherNameList;
    if (startedRacers !== null) this.startedRacers = startedRacers;
    if (starterNameList !== null) this.starterNameList = starterNameList;
    if (currentRacerIndex !== null) this.currentRacerIndex$.next(currentRacerIndex);
    if (categoriesMap !== null) this.categoriesMap$.next(categoriesMap);

    if (this.checkRacersDataInLS()) {
      this.racers$.next(this.readRacersFromLS());
    } else {
      this.updateRacersDataFromJSON();
    }

    this.racers$.pipe(
      tap((value) => {
        this.updateRacersDataInLS(value);
      })
    ).subscribe();
  }

  public updateRacersDataInLS(value: IRacer[]) {
    window.localStorage.setItem("racers", JSON.stringify(value));
  }

  public updateCategoriesMapInLS(value: Record<string, IRacer[]>) {
    window.localStorage.setItem("categoriesMap", JSON.stringify(value));
  }

  public updateStartedRacersInLS(value: IStarter[]) {
    window.localStorage.setItem("starters", JSON.stringify(value));
  }

  public updateStarterNameListInLS(value: string[]) {
    window.localStorage.setItem("starterNameList", JSON.stringify(value));
  }

  public updateFinishersDataInLS(value: IFinisher[]) {
    window.localStorage.setItem("finishers", JSON.stringify(value));
  }

  public updateFinishersByCategoriesInLS(value: IFinishCategory[]) {
    window.localStorage.setItem("finishersByCategories", JSON.stringify(value));
  }

  public updateAnonsInLS(value: IFinisher[]) {
    window.localStorage.setItem("anons", JSON.stringify(value));
  }

  public updateFinisherNameListInLS(value: string[]) {
    window.localStorage.setItem("finisherNameList", JSON.stringify(value));
  }

  public updateCurrentRacerIndexInLS(value: number) {
    window.localStorage.setItem("currentRacerIndex", JSON.stringify(value));
  }

  public updateCurrentAnonIndexInLS(value: number) {
    window.localStorage.setItem("currentAnonIndex", JSON.stringify(value));
  }

  public readRacersFromLS() {
    return JSON.parse(window.localStorage.getItem("racers")!);
  }

  public readCategoriesMapFromLS() {
    return JSON.parse(window.localStorage.getItem("categoriesMap")!);
  }

  public readStartedRacersFromLS() {
    return JSON.parse(window.localStorage.getItem("starters")!);
  }

  public readStarterNameListFromLS() {
    return JSON.parse(window.localStorage.getItem("starterNameList")!);
  }

  public readCurrentRacerIndexFromLS() {
    return JSON.parse(window.localStorage.getItem("currentRacerIndex")!);
  }

  public readCurrentAnonIndexFromLS() {
    return JSON.parse(window.localStorage.getItem("currentAnonIndex")!);
  }

  public readFinishersFromLS() {
    return JSON.parse(window.localStorage.getItem("finishers")!);
  }

  public readFinishersByCategoriesFromLS() {
    return JSON.parse(window.localStorage.getItem("finishersByCategories")!);
  }

  public readAnonsFromLS() {
    return JSON.parse(window.localStorage.getItem("anons")!);
  }

  public readFinisherNameListFromLS() {
    return JSON.parse(window.localStorage.getItem("finisherNameList")!);
  }

  public checkRacersDataInLS(): boolean {
    return window.localStorage.getItem("racers") !== null;
  }

  public collectDataFromLS() {
    const racers = this.readRacersFromLS();
    const categoriesMap = this.readCategoriesMapFromLS();
    const starters = this.readStartedRacersFromLS();
    const starterNameList = this.readStarterNameListFromLS();
    const currentRacerIndex = this.readCurrentRacerIndexFromLS();
    const currentAnonIndex = this.readCurrentAnonIndexFromLS();
    const finishers = this.readFinishersFromLS();
    const finishersByCategories = this.readFinishersByCategoriesFromLS();
    const anons = this.readAnonsFromLS();
    const finisherNameList = this.readFinisherNameListFromLS();

    return {
      name: "Кутаис 2023",
      racers: racers ? racers : [],
      categoriesMap: categoriesMap ? categoriesMap : {},
      starters: starters ? starters : [],
      starterNameList: starterNameList ? starterNameList : [],
      currentRacerIndex: currentRacerIndex ? currentRacerIndex : 0,
      currentAnonIndex: currentAnonIndex ? currentAnonIndex : 0,
      finishers: finishers ? finishers : [],
      finishersByCategories: finishersByCategories ? finishersByCategories : [],
      anons: anons ? anons : [],
      finisherNameList: finisherNameList ? finisherNameList : []
    };
  }

  /**
   * TODO: Починить
   */
  // public setStateFromJSON() {
  //   this.httpClient.get<ISyncJSON>(this.URL_SYNC_JSON).pipe(
  //     tap((data: ISyncJSON) => {
  //       this.updateRacersDataInLS(data.racers);
  //       this.updateCategoriesMapInLS(data.categoriesMap);
  //       this.updateStartedRacersInLS(data.starters);
  //       this.updateStarterNameListInLS(data.starterNameList);
  //       this.updateCurrentRacerIndexInLS(data.currentRacerIndex);
  //       this.updateCurrentAnonIndexInLS(data.currentAnonIndex);
  //       this.updateFinishersDataInLS(data.finishers);
  //       this.updateFinishersByCategoriesInLS(data.finishersByCategories);
  //       this.updateAnonsInLS(data.anons);
  //       this.updateFinisherNameListInLS(data.finisherNameList);
  //
  //       window.location.reload();
  //     })
  //   ).subscribe();
  // }

  public updateRacersDataFromJSON() {
    this.httpClient.get<IRacer[]>(this.URL).pipe(
      tap((data: IRacer[]) => {
        const racers: IRacer[] = [];
        const categoriesMap: Record<string, IRacer[]> = {};

        data.forEach((racer) => {
          racers.push(racer);
          if (Array.isArray(categoriesMap[racer.category])) {
            categoriesMap[racer.category].push(racer);
          } else {
            categoriesMap[racer.category] = [];
            categoriesMap[racer.category].push(racer);
          }
        });

        this.categoriesMap$.next(categoriesMap);
        this.updateCategoriesMapInLS(categoriesMap);
        this.racers$.next(racers);
      })
    ).subscribe();
  }

  public resetLS() {
    window.localStorage.clear();
  }
}
