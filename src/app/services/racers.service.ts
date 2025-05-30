import {Injectable} from "@angular/core";
import {BehaviorSubject, finalize, map, takeWhile, tap, timer} from "rxjs";
import {RepositoryService} from "./repository.service";
import {IRacer, IStarter, ISyncJSON} from "../models/interfaces";
import {FinishersService} from "./finishers.service";
import {DEFAULT_ITT_RACE_NAME} from "../constants/itt.constants";

@Injectable({
  providedIn: "root"
})
export class RacersService {
  private timerDelta = 0;
  public currentRacerIndex$ = new BehaviorSubject(0);

  public raceName$ = new BehaviorSubject<string>(DEFAULT_ITT_RACE_NAME);

  public racers$ = new BehaviorSubject<IRacer[]>([]);
  public startedRacers: IStarter[] = [];
  public starterNameList: string[] = [];
  public categoriesMap$ = new BehaviorSubject<Record<string, IRacer[]>>({});

  public racerSecondsDelta = 1;
  public isRaceStarted$ = new BehaviorSubject(false);
  public isRacePaused$ = new BehaviorSubject(false);
  public isAllMembersStarted$ = new BehaviorSubject(false);
  public isAllMembersHasNumbers$ = new BehaviorSubject(false);

  public timer$ = timer(0, 1000).pipe(
    map(i => this.racerSecondsDelta - i + this.timerDelta),
    tap((value) => {
      if (value === 0) {
        const currentRacer = this.racers$.value[this.currentRacerIndex$.value];

        this.startedRacers.push({
          racer: currentRacer,
          time: Date.now()
        });

        this.repositoryService.updateStartedRacers(this.startedRacers);
        this.starterNameList.push(this.generateRacerNameAndNumberString(currentRacer));
        this.repositoryService.updateStarterNameList(this.starterNameList);

        this.timerDelta += this.racerSecondsDelta;
        this.currentRacerIndex$.next(this.currentRacerIndex$.value + 1);
        this.repositoryService.updateCurrentRacerIndex(this.currentRacerIndex$.value);
      }
    }),
    takeWhile(() => this.racers$.value.length !== this.currentRacerIndex$.value),
    finalize(() => {
      if (this.isRacePaused$.value) {
        this.timerDelta = 0;
      } else {
        this.isAllMembersStarted$.next(true);
      }
    })
  );

  constructor(private repositoryService: RepositoryService, private finishersService: FinishersService) {
    this.initRaceData();
  }

  private initRaceData() {
    const startedRacers = this.repositoryService.readStartedRacers();
    const starterNameList = this.repositoryService.readStarterNameList();
    const currentRacerIndex = this.repositoryService.readCurrentRacerIndex();
    const categoriesMap = this.repositoryService.readCategoriesMap();
    const raceName = this.repositoryService.readRaceName();

    if (startedRacers !== null) this.startedRacers = startedRacers;
    if (starterNameList !== null) this.starterNameList = starterNameList;
    if (currentRacerIndex !== null) this.currentRacerIndex$.next(currentRacerIndex);
    if (categoriesMap !== null) this.categoriesMap$.next(categoriesMap);
    if (raceName !== null) this.raceName$.next(raceName);
  }

  public setStateFromJSON(data: ISyncJSON) {
    this.repositoryService.setStateFromJSON(data);
    this.initRaceData()
  }

  public continuePrevRace() {
    this.initRaceData()
    this.updateRacers(this.repositoryService.readRacers())
    this.updateCategoriesMap(this.repositoryService.readCategoriesMap())
  }

  public resetRace(): void {
    this.finishersService.resetFinishersData();

    this.currentRacerIndex$.next(0);
    this.racers$.next([]);
    this.isRaceStarted$.next(false);
    this.isRacePaused$.next(false);
    this.isAllMembersStarted$.next(false);
    this.isAllMembersHasNumbers$.next(false);
    this.categoriesMap$.next({});
    this.raceName$.next(DEFAULT_ITT_RACE_NAME);

    this.startedRacers = [];
    this.starterNameList = [];

    this.timerDelta = 0;
  }

  public readRacersFromGoogleSheet(url: string) {
    this.repositoryService.readRacersDataFromGoogleSheet(url).pipe(
      tap(({ racers, categoriesMap }) => {
        this.updateRacers(racers);
        this.updateCategoriesMap(categoriesMap);
      })
    ).subscribe()
  }

  public checkAllMembersHasNumbers() {
    let accumulator = true;
    this.racers$.value.forEach((racer) => accumulator = (racer.number !== null) && accumulator)

    this.isAllMembersHasNumbers$.next(accumulator);
  }

  public updateRacers(racers: IRacer[]) {
    this.racers$.next(racers);
    this.repositoryService.updateRacers(racers);
    this.checkAllMembersHasNumbers();
  }

  public updateCategoriesMap(categoriesMap: Record<string, IRacer[]>) {
    this.categoriesMap$.next(categoriesMap);
    this.repositoryService.updateCategoriesMap(categoriesMap);
  }

  public updateRaceName(raceName: string) {
    this.repositoryService.updateRaceName(raceName);
    this.raceName$.next(raceName);
  }

  public generateRacerNameAndNumberString(racer: IRacer) {
    if (racer.number !== null) {
      return `${racer.name} — ${racer.number}`
    }

    return racer.name;
  }

  public splitRacerNameAndNumberString(nameAndNumber: string) {
    const splitString = nameAndNumber.split(' — ');

    return { name: splitString[0], number: Number(splitString[1]) };
  }
}
