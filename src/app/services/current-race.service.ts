import {Injectable} from '@angular/core';
import {RepositoryService} from "./repository.service";
import {RacersService} from "./racers.service";
import {ISyncJSON} from "../models/interfaces";
import {DEFAULT_DELTA, DEFAULT_RACE_NAME} from "../constants/itt.constants";
import {BehaviorSubject, finalize, map, takeWhile, tap, timer} from "rxjs";
import {RaceType} from "../models/enums";

@Injectable({
  providedIn: 'root'
})
export class CurrentRaceService {
  /**
   * Для ITT режима
   */
  private timerDelta = 0;
  public racerSecondsDelta = DEFAULT_DELTA;

  public raceName$ = new BehaviorSubject<string>(DEFAULT_RACE_NAME);

  public raceType$ = new BehaviorSubject<RaceType>(RaceType.ITT);

  public isRaceStarted$ = new BehaviorSubject(false);
  public isRacePaused$ = new BehaviorSubject(false);
  public isRaceBeginning$ = new BehaviorSubject(false);
  public isAllMembersStarted$ = new BehaviorSubject(false);
  public isDeltaChanged$ = new BehaviorSubject(false);

  public currentRacerIndex$ = new BehaviorSubject(0);

  public ittRaceTimer$ = timer(0, 1000).pipe(
    map(i => this.racerSecondsDelta - i + this.timerDelta),
    tap((value) => {
      if (value === 0) {
        const currentRacer = this.racersService.racers$.value[this.currentRacerIndex$.value];

        this.racersService.startedRacers.push({
          racer: currentRacer,
          time: Date.now()
        });

        const starterNameList = this.racersService.starterNameList$.value.slice();
        starterNameList.push(this.racersService.generateRacerNameAndNumberString(currentRacer));

        this.repositoryService.updateStartedRacers(this.racersService.startedRacers);
        this.racersService.starterNameList$.next(starterNameList);
        this.repositoryService.updateStarterNameList(this.racersService.starterNameList$.value);

        this.timerDelta += this.racerSecondsDelta;
        this.currentRacerIndex$.next(this.currentRacerIndex$.value + 1);
        this.repositoryService.updateCurrentRacerIndex(this.currentRacerIndex$.value);
      }
    }),
    takeWhile(() => this.racersService.racers$.value.length !== this.currentRacerIndex$.value),
    finalize(() => {
      if (this.isRacePaused$.value) {
        this.timerDelta = 0;
      } else {
        this.isAllMembersStarted$.next(true);
      }
    })
  );

  public groupRaceTimer$ = timer(0, 1000);

  constructor(private repositoryService: RepositoryService, private racersService: RacersService) {
    this.initCurrentRaceData();
  }

  public initCurrentRaceData() {
    const raceType = this.repositoryService.readRaceType();
    const currentRacerIndex = this.repositoryService.readCurrentRacerIndex();
    const raceName = this.repositoryService.readRaceName();
    const racersDelta = this.repositoryService.readRacersDelta();
    const starterNameList = this.repositoryService.readStarterNameList();

    if (currentRacerIndex !== null) this.currentRacerIndex$.next(currentRacerIndex);
    if (raceName !== null) this.raceName$.next(raceName);
    if (racersDelta !== null) this.setRacersDelta(racersDelta);
    if (starterNameList !== null) this.isRaceBeginning$.next(true);

    this.raceType$.next(raceType ?? RaceType.ITT);
  }

  public setStateFromJSON(data: ISyncJSON) {
    this.repositoryService.setStateFromJSON(data);
    this.continuePrevRace();
  }

  public resetCurrentRace() {
    this.currentRacerIndex$.next(0);
    this.isRaceStarted$.next(false);
    this.isRacePaused$.next(false);
    this.isRaceBeginning$.next(false);
    this.isAllMembersStarted$.next(false);
    this.raceName$.next(DEFAULT_RACE_NAME);
    this.raceType$.next(RaceType.ITT);
    this.timerDelta = 0;
    this.racerSecondsDelta = DEFAULT_DELTA;
    this.isDeltaChanged$.next(true);
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
}
