import {Injectable} from "@angular/core";
import {BehaviorSubject, finalize, map, takeWhile, tap, timer} from "rxjs";
import {RepositoryService} from "./repository.service";
import {IRacer, IStarter, ISyncJSON} from "../models/interfaces";
import {FinishersService} from "./finishers.service";
import {DEFAULT_ITT_RACE_NAME, RACERS_DELTA} from "../constants/itt.constants";

@Injectable({
  providedIn: "root"
})
export class RacersService {
  private timerDelta = 0;
  public currentRacerIndex$ = new BehaviorSubject(0);

  public raceName$ = new BehaviorSubject<string>(DEFAULT_ITT_RACE_NAME);

  public racers$ = new BehaviorSubject<IRacer[]>([]);
  public startedRacers: IStarter[] = [];
  public starterNameList$ = new BehaviorSubject<string[]>([]);
  public categoriesMap$ = new BehaviorSubject<Record<string, IRacer[]>>({});

  public racerSecondsDelta = RACERS_DELTA;
  public isRaceStarted$ = new BehaviorSubject(false);
  public isRacePaused$ = new BehaviorSubject(false);
  public isAllMembersStarted$ = new BehaviorSubject(false);
  public isAllMembersHasNumbers$ = new BehaviorSubject(false);
  public isDeltaChanged$ = new BehaviorSubject(false);

  public timer$ = timer(0, 1000).pipe(
    map(i => this.racerSecondsDelta - i + this.timerDelta),
    tap((value) => {
      if (value === 0) {
        const currentRacer = this.racers$.value[this.currentRacerIndex$.value];

        this.startedRacers.push({
          racer: currentRacer,
          time: Date.now()
        });

        const starterNameList = this.starterNameList$.value.slice();
        starterNameList.push(this.generateRacerNameAndNumberString(currentRacer));

        this.repositoryService.updateStartedRacers(this.startedRacers);
        this.starterNameList$.next(starterNameList);
        this.repositoryService.updateStarterNameList(this.starterNameList$.value);

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
    const racersDelta = this.repositoryService.readRacersDelta();

    if (startedRacers !== null) this.startedRacers = startedRacers;
    if (starterNameList !== null) this.starterNameList$.next(starterNameList);
    if (currentRacerIndex !== null) this.currentRacerIndex$.next(currentRacerIndex);
    if (categoriesMap !== null) this.categoriesMap$.next(categoriesMap);
    if (raceName !== null) this.raceName$.next(raceName);
    if (racersDelta !== null) this.setRacersDelta(racersDelta);
  }

  private convertCategoryName(registerCategoryName: string): string {
    switch (registerCategoryName) {
      case 'Шоссе (групповой велосипед)':
        return 'Шоссе'
      case 'Шоссе (разделочник или групповой с лежаком)':
        return 'Шоссе ТТ'
      default:
        return registerCategoryName
    }
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
    this.starterNameList$.next([]);

    this.timerDelta = 0;
    this.racerSecondsDelta = RACERS_DELTA;
    this.isDeltaChanged$.next(true);
  }

  public setRacersFromGoogleSheet(data: Record<string, any>[], cellName: string, cellCategory: string) {
    const racers: IRacer[] = [];
    const categoriesMap: Record<string, IRacer[]> = {};

    data.forEach((registerInfo) => {
      const name = registerInfo[cellName];
      const category = this.convertCategoryName(registerInfo[cellCategory]);

      if (name && category) {
        const racer = {
          name,
          category: this.convertCategoryName(registerInfo[cellCategory]),
          number: null
        }
        racers.push(racer);

        if (Array.isArray(categoriesMap[racer.category])) {
          categoriesMap[racer.category].push(racer);
        } else {
          categoriesMap[racer.category] = [];
          categoriesMap[racer.category].push(racer);
        }
      }
    });

    if (racers.length > 0) {
      this.updateCategoriesMap(categoriesMap);
      this.updateRacers(racers);
    }

    return { racers, categoriesMap };
  }

  public checkAllMembersHasNumbers() {
    let accumulator = true;
    this.racers$.value.forEach((racer) => accumulator = (racer.number !== null) && accumulator)

    this.isAllMembersHasNumbers$.next(accumulator);
  }

  public setRacersDelta(delta: number) {
    this.racerSecondsDelta = delta;
    this.repositoryService.updateRacersDelta(delta);
    this.isDeltaChanged$.next(true);
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
