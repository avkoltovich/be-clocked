import { Injectable } from "@angular/core";
import { BehaviorSubject, finalize, map, takeWhile, tap, timer } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { IFinishCategory, IFinisher } from "../containers/finish-race/finish-race.component";
import {RepositoryService} from "./repository.service";

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
  racers: IRacer[];
  categoriesMap: Record<string, IRacer[]>;
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
        this.repositoryService.updateStartedRacers(this.startedRacers);
        this.starterNameList.push(this.racers$.value[this.currentRacerIndex$.value].name);
        this.repositoryService.updateStarterNameList(this.starterNameList);

        this.timerDelta += this.racerSecondsDelta;
        this.currentRacerIndex$.next(this.currentRacerIndex$.value + 1);
        this.repositoryService.updateCurrentRacerIndex(this.currentRacerIndex$.value);
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

  constructor(private repositoryService: RepositoryService) {
    const finisherNameList = repositoryService.readFinisherNameList();
    const startedRacers = repositoryService.readStartedRacers();
    const starterNameList = repositoryService.readStarterNameList();
    const currentRacerIndex = repositoryService.readCurrentRacerIndex();
    const categoriesMap = repositoryService.readCategoriesMap();

    if (finisherNameList !== null) this.finisherNameList = finisherNameList;
    if (startedRacers !== null) this.startedRacers = startedRacers;
    if (starterNameList !== null) this.starterNameList = starterNameList;
    if (currentRacerIndex !== null) this.currentRacerIndex$.next(currentRacerIndex);
    if (categoriesMap !== null) this.categoriesMap$.next(categoriesMap);

    if (this.repositoryService.checkRacers()) {
      this.racers$.next(repositoryService.readRacers());
    } else {
      this.readRacersFromJSON();
    }
  }

  private readRacersFromJSON() {
    this.repositoryService.readRacersDataFromJSON().pipe(
      tap(({ racers, categoriesMap }) => {
        this.categoriesMap$.next(categoriesMap);
        this.racers$.next(racers);
      })
    ).subscribe()
  }
}
