import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {RepositoryService} from "./repository.service";
import {IRacer, IStarter} from "../models/interfaces";
import {FinishersService} from "./finishers.service";

@Injectable({
  providedIn: "root"
})
export class RacersService {
  public racers$ = new BehaviorSubject<IRacer[]>([]);
  public startedRacers: IStarter[] = [];
  public starterNameList$ = new BehaviorSubject<string[]>([]);
  public categoriesMap$ = new BehaviorSubject<Record<string, IRacer[]>>({});

  public isAllMembersHasNumbers$ = new BehaviorSubject(false);

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
    const starterNameList = this.repositoryService.readStarterNameList();
    const categoriesMap = this.repositoryService.readCategoriesMap();

    if (racers !== null) this.racers$.next(racers);
    if (startedRacers !== null) this.startedRacers = startedRacers;
    if (starterNameList !== null) this.starterNameList$.next(starterNameList);
    if (categoriesMap !== null) this.categoriesMap$.next(categoriesMap);

    this.checkAllMembersHasNumbers();
  }

  public resetRacersData(): void {
    this.finishersService.resetFinishersData();

    this.racers$.next([]);

    this.isAllMembersHasNumbers$.next(false);
    this.categoriesMap$.next({});

    this.startedRacers = [];
    this.starterNameList$.next([]);
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

  public updateRacers(racers: IRacer[]) {
    this.racers$.next(racers);
    this.repositoryService.updateRacers(racers);
    this.checkAllMembersHasNumbers();
  }

  public updateCategoriesMap(categoriesMap: Record<string, IRacer[]>) {
    this.categoriesMap$.next(categoriesMap);
    this.repositoryService.updateCategoriesMap(categoriesMap);
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
