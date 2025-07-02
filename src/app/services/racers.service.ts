import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {RepositoryService} from "./repository.service";
import {IRacer, IStarter} from "../models/interfaces";
import {FinishersService} from "./finishers.service";
import {RacerStatus} from "../models/enums";

@Injectable({
  providedIn: "root"
})
export class RacersService {
  public racers$ = new BehaviorSubject<IRacer[]>([]);
  public startedRacers: IStarter[] = [];
  public skippedRacers: number[] = [];
  public starterNameList$ = new BehaviorSubject<string[]>([]);
  public categoriesMap$ = new BehaviorSubject<Record<string, IRacer[]>>({});

  public isAllRacersHasNumbers$ = new BehaviorSubject(false);

  constructor(private repositoryService: RepositoryService, private finishersService: FinishersService) {
    this.initRacersData();
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

  public initRacersData() {
    const racers: IRacer[] = this.repositoryService.readRacers();
    const startedRacers = this.repositoryService.readStartedRacers();
    const skippedRacers = this.repositoryService.readSkippedRacers();
    const starterNameList = this.repositoryService.readStarterNameList();
    const categoriesMap = this.repositoryService.readCategoriesMap();

    if (racers !== null) this.racers$.next(racers);
    if (startedRacers !== null) this.startedRacers = startedRacers;
    if (skippedRacers !== null) this.skippedRacers = skippedRacers;
    if (starterNameList !== null) this.starterNameList$.next(starterNameList);
    if (categoriesMap !== null) this.categoriesMap$.next(categoriesMap);

    this.checkAllMembersHasNumbers();
    this.validateRacersData();
  }

  public resetRacersData(): void {
    this.finishersService.resetFinishersData();

    this.racers$.next([]);

    this.isAllRacersHasNumbers$.next(false);
    this.categoriesMap$.next({});

    this.startedRacers = [];
    this.starterNameList$.next([]);
  }

  public startRacerByIndex(index: number) {
    const currentRacers = this.racers$.value.slice();
    const currentRacer = currentRacers[index];

    if (this.skippedRacers.includes(currentRacer.number!)) {
      currentRacer.status = RacerStatus.SKIPPED;

      return;
    }

    currentRacer.status = RacerStatus.STARTED;

    this.startedRacers.push({
      racer: currentRacer,
      time: Date.now()
    });

    const starterNameList = this.starterNameList$.value.slice();
    starterNameList.push(this.generateRacerNameAndNumberString(currentRacer));

    this.repositoryService.updateStartedRacers(this.startedRacers);
    this.starterNameList$.next(starterNameList);
    this.repositoryService.updateStarterNameList(this.starterNameList$.value);
    this.updateRacers(currentRacers);
  }

  public updateRacerStatusByIndex(index: number, status: RacerStatus) {
    const currentRacers = this.racers$.value.slice();
    currentRacers[index].status = status;

    this.updateRacers(currentRacers);
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
          number: null,
          status: RacerStatus.READY
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

    this.isAllRacersHasNumbers$.next(accumulator);
  }

  public validateRacersData(): void {
    const racers = this.racers$.value.slice();
    const validatedRacers = racers.map((racer: IRacer) => {
      if (racer.number === undefined) racer.number = null;

      const isFinished = this.finishersService.finisherNameList.includes(this.generateRacerNameAndNumberString(racer));
      const isSkipped = this.skippedRacers.includes(racer.number!);
      const isStarted = this.starterNameList$.value.includes(this.generateRacerNameAndNumberString(racer));

      if (racer.status === undefined) {
        if (isStarted) racer.status = RacerStatus.STARTED;
        if (isFinished) racer.status = RacerStatus.FINISHED;
        if (isSkipped) racer.status = RacerStatus.SKIPPED;
      }

      return racer;
    })

    this.updateRacers(validatedRacers);
  }

  public startAllRacers(startTime: number): void {
    const starterNameList: string[] = [];

    const startedRacers = this.racers$.value.map((racer: IRacer) => {
      const startedRacer = {
        ...racer,
        status: RacerStatus.STARTED
      }

      this.startedRacers.push({
        racer: startedRacer,
        time: startTime
      });

      starterNameList.push(this.generateRacerNameAndNumberString(startedRacer));

      return startedRacer
    });

    this.racers$.next(startedRacers);
    this.repositoryService.updateRacers(startedRacers);

    this.repositoryService.updateStartedRacers(this.startedRacers);

    this.starterNameList$.next(starterNameList);
    this.repositoryService.updateStarterNameList(starterNameList);
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

  public skipRacer(racer: IRacer) {
    if (racer.number !== null && racer.number !== undefined) {
      this.skippedRacers.push(racer.number);
      this.repositoryService.updateSkippedRacers(this.skippedRacers);
    }
  }

  public undoSkipRacer(skippedRacer: IRacer) {
    if (skippedRacer.number !== null && skippedRacer.number !== undefined) {
      this.skippedRacers.pop();
      this.repositoryService.updateSkippedRacers(this.skippedRacers);
    }
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
