import {Injectable} from "@angular/core";
import {BehaviorSubject, finalize, map, takeWhile, tap, timer} from "rxjs";
import {RepositoryService} from "./repository.service";
import {IRacer, IStarter} from "../models/interfaces";

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

  public updateRacers(racers: IRacer[]) {
    this.racers$.next(racers);
    this.repositoryService.updateRacers(racers);
  }

  public updateCategoriesMap(categoriesMap: Record<string, IRacer[]>) {
    this.categoriesMap$.next(categoriesMap);
    this.repositoryService.updateCategoriesMap(categoriesMap);
  }

  public generateRacerNameAndNumberString(racer: IRacer) {
    return `${racer.name} — ${racer.number}`
  }

  public splitRacerNameAndNumberString(nameAndNumber: string) {
    const splitString = nameAndNumber.split(' — ');

    return { name: splitString[0], number: Number(splitString[1]) };
  }
}
