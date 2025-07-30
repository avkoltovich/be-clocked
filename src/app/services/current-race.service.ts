import {Injectable} from '@angular/core';
import {RepositoryService} from "./repository.service";
import {RacersService} from "./racers.service";
import {IRacer, ISyncJSON} from "../models/interfaces";
import {DEFAULT_DELTA, DEFAULT_RACE_NAME} from "../constants/itt.constants";
import {BehaviorSubject, finalize, map, takeWhile, tap, timer} from "rxjs";
import {RaceType} from "../models/enums";
import {FinishersService} from "./finishers.service";

@Injectable({
  providedIn: 'root'
})
export class CurrentRaceService {
  /**
   * Для ITT режима
   */
  private timerDelta = 0;
  public racerSecondsDelta = DEFAULT_DELTA;

  /**
   * Для Группового режима
   */
  public lapByCategoriesMap: Record<string, number> = {}
  public raceStartTime$ = new BehaviorSubject<number | null>(null);
  public raceEndTime$ = new BehaviorSubject<number | null>(null);

  public raceName$ = new BehaviorSubject<string>(DEFAULT_RACE_NAME);

  public raceType$ = new BehaviorSubject<RaceType>(RaceType.ITT);

  public isRaceStarted$ = new BehaviorSubject(false);
  public isRacePaused$ = new BehaviorSubject(false);
  public isRaceBeginning$ = new BehaviorSubject(false);
  public isRaceEnded$ = new BehaviorSubject(false);
  public isAllRacersStarted$ = new BehaviorSubject(false);
  public isDeltaChanged$ = new BehaviorSubject(false);

  public currentRacerIndex$ = new BehaviorSubject(0);

  public ittRaceTimer$ = timer(0, 1000).pipe(
    map(i => this.racerSecondsDelta - i + this.timerDelta),
    tap((value) => {
      if (value === 0) {
        this.racersService.startRacerByIndex(this.currentRacerIndex$.value);

        this.timerDelta += this.racerSecondsDelta;
        this.currentRacerIndex$.next(this.currentRacerIndex$.value + 1);
        this.repositoryService.updateCurrentRacerIndex(this.currentRacerIndex$.value);
      }
    }),
    takeWhile(() => this.racersService.racers$.value.length > this.currentRacerIndex$.value),
    finalize(() => {
      if (this.isRacePaused$.value) {
        this.timerDelta = 0;
      } else {
        this.isAllRacersStarted$.next(true);
      }
    })
  );

  get isLapRace() {
    for (let key in this.lapByCategoriesMap) {
      if (this.lapByCategoriesMap[key] > 1) return true;
    }

    return false;
  }

  constructor(private repositoryService: RepositoryService, private racersService: RacersService, private finisherService: FinishersService) {
    this.initCurrentRaceData();
  }

  public initCurrentRaceData() {
    const raceType = this.repositoryService.readRaceType();
    const currentRacerIndex = this.repositoryService.readCurrentRacerIndex();
    const raceName = this.repositoryService.readRaceName();
    const racersDelta = this.repositoryService.readRacersDelta();
    const starterNameList = this.repositoryService.readStarterNameList();
    const racers: IRacer[] = this.repositoryService.readRacers();
    const lapByCategoriesMap = this.repositoryService.readLapByCategoriesMap();
    const isRaceEnded = this.repositoryService.readIsRaceEnded();
    this.raceStartTime$.next(this.repositoryService.readRaceStartTime());
    this.raceEndTime$.next(this.repositoryService.readRaceEndTime());

    if (currentRacerIndex !== null) this.currentRacerIndex$.next(currentRacerIndex);
    if (raceName !== null) this.raceName$.next(raceName);
    if (racersDelta !== null) this.setRacersDelta(racersDelta);
    if (starterNameList !== null && starterNameList?.length > 0 && !isRaceEnded) this.isRaceBeginning$.next(true);
    if (racers !== null && racers.length > 0) this.isAllRacersStarted$.next(this.currentRacerIndex$.value >= racers.length);
    if (lapByCategoriesMap !== null) this.lapByCategoriesMap = lapByCategoriesMap;

    this.isRaceEnded$.next(isRaceEnded);
    this.raceType$.next(raceType ?? RaceType.ITT);
  }

  public setStateFromJSON(data: ISyncJSON) {
    this.repositoryService.setStateFromJSON(data);
    this.finisherService.initFinishersData();
    this.racersService.initRacersData();
    this.continuePrevRace();
  }

  public resetCurrentRace() {
    this.currentRacerIndex$.next(0);
    this.isRaceStarted$.next(false);
    this.isRacePaused$.next(false);
    this.isRaceBeginning$.next(false);
    this.isRaceEnded$.next(false);
    this.isAllRacersStarted$.next(false);
    this.raceName$.next(DEFAULT_RACE_NAME);
    this.raceType$.next(RaceType.ITT);
    this.timerDelta = 0;
    this.racerSecondsDelta = DEFAULT_DELTA;
    this.isDeltaChanged$.next(true);
    this.raceStartTime$.next(null);
    this.raceEndTime$.next(null);
    this.lapByCategoriesMap = {};
  }

  public continuePrevRace() {
    this.initCurrentRaceData();
  }

  public setRacersDelta(delta: number) {
    this.racerSecondsDelta = delta;
    this.repositoryService.updateRacersDelta(delta);
    this.isDeltaChanged$.next(true);
  }

  public updateRaceName(raceName: string) {
    this.repositoryService.updateRaceName(raceName);
    this.raceName$.next(raceName);
  }

  public startGroupRace(startTime: number) {
    this.isRaceStarted$.next(true);
    this.isRaceBeginning$.next(true);
    this.raceStartTime$.next(startTime);
    this.repositoryService.updateRaceStartTime(startTime);
  }

  public updateRaceStartTime(startTime: number | null) {
    this.repositoryService.updateRaceStartTime(startTime);
    this.raceStartTime$.next(startTime);
  }

  public updateLapByCategoriesMap(category: string, lapCount: number) {
    this.lapByCategoriesMap[category] = lapCount;
    this.repositoryService.updateLapByCategoriesMap(this.lapByCategoriesMap);
  }

  public updateRaceType(raceType: RaceType) {
    this.raceType$.next(raceType);
  }

  public setRaceBeginning(value: boolean) {
    this.isRaceBeginning$.next(value);
  }

  public endGroupRace() {
    this.isRaceEnded$.next(true);
    this.isRaceBeginning$.next(false);
    this.raceEndTime$.next(Date.now());
    this.repositoryService.updateIsRaceEnded(true);
  }
}
