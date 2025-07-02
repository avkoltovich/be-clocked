import {AfterViewInit, Component, Inject, TemplateRef, ViewChild} from "@angular/core";
import {BehaviorSubject, Subscription, takeUntil, tap} from "rxjs";
import {RacersService} from "../../services/racers.service";
import {TuiDialogService} from "@taiga-ui/core";
import {RepositoryService} from "../../services/repository.service";
import {IRacer, ISyncJSON} from "../../models/interfaces";
import {FinishersService} from "../../services/finishers.service";
import {RaceStatus, RaceType} from "../../models/enums";
import {IGoogleTableData} from "../../components/google-table-stepper/google-table-stepper.component";
import {CurrentRaceService} from "../../services/current-race.service";
import {TuiDestroyService} from "@taiga-ui/cdk";

@Component({
  selector: "app-current-race",
  templateUrl: "./current-race.component.html",
  styleUrls: ["./current-race.component.scss"]
})
export class CurrentRaceComponent implements AfterViewInit {
  private ittTimerSubscription: Subscription | null = null;
  readonly RaceStatus = RaceStatus;
  readonly RaceType = RaceType;

  /**
   * Для ITT режима
   */
  public maxTimerValue = this.currentRaceService.racerSecondsDelta;
  public currentTimerValue = this.currentRaceService.racerSecondsDelta;
  public currentRacerSkipped = false;

  /**
   * Состояние компонента
   */
  public raceStatus$ = new BehaviorSubject(RaceStatus.PREPARE);

  /**
   * Потоки
   */
  public currentRacerIndex$ = this.currentRaceService.currentRacerIndex$;
  public isRaceStarted$ = this.currentRaceService.isRaceStarted$;
  public isRacePaused$ = this.currentRaceService.isRacePaused$;
  public isAllRacersStarted$ = this.currentRaceService.isAllRacersStarted$;
  public isAllRacersHasNumbers$ = this.racersService.isAllRacersHasNumbers$;
  public raceName$ = this.currentRaceService.raceName$;
  public raceType$ = this.currentRaceService.raceType$;
  public isRaceBeginning$ = this.currentRaceService.isRaceBeginning$;

  /**
   * Для Группового режима
   */
  public ittRaceTimer$ = this.currentRaceService.ittRaceTimer$.pipe(
    tap((value) => {
      this.currentTimerValue = value;
    })
  );
  public groupRaceTimer$ = this.currentRaceService.groupRaceTimer$;
  public racers$ = this.racersService.racers$.pipe(
    tap((racers) => {
      if (racers.length > 0) this.raceStatus$.next(RaceStatus.READY);
    })
  );

  @ViewChild('newRace') newRace: TemplateRef<any> | undefined;

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private racersService: RacersService,
    private repositoryService: RepositoryService,
    private finishersService: FinishersService,
    private currentRaceService: CurrentRaceService,
    private readonly destroy$: TuiDestroyService,
  ) {
  }

  private resetDeltaTimer() {
    this.currentTimerValue = this.currentRaceService.racerSecondsDelta;
  }

  private setDataFromGoogleTable(data: IGoogleTableData): void {
    const { tableKeys, tableData } = data
    const { name, category } = tableKeys;
    this.racersService.setRacersFromGoogleSheet(tableData, name, category);
  }

  public ngAfterViewInit(): void {
    if (this.racersService.racers$.value.length > 0) {
      this.dialogs.open(this.newRace, {size: 'auto'}).subscribe();
    }
    else {
      this.repositoryService.resetLS();
    }

    this.currentRaceService.isDeltaChanged$.pipe(
      tap(() => {
        const currentDelta = this.currentRaceService.racerSecondsDelta;

        this.maxTimerValue = currentDelta;
        this.currentTimerValue = currentDelta;
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.currentRacerIndex$.pipe(
      tap(() => {
        this.currentRacerSkipped = false;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  public onStart() {
    if (this.raceType$.value === RaceType.ITT) {
      this.currentRaceService.isRaceStarted$.next(true);
      this.ittTimerSubscription = this.ittRaceTimer$.subscribe();
    }

    if (this.raceType$.value === RaceType.GROUP) {
      const startTime = Date.now();
      this.currentRaceService.startGroupRace(startTime);
      this.racersService.startAllRacers(startTime);
    }
  }

  public onSkip() {
    const skippedRacer = this.racersService.racers$.value[this.currentRacerIndex$.value];
    this.racersService.skipRacer(skippedRacer);
    this.currentRacerSkipped = true;
  }

  public onUndoSkip() {
    const skippedRacer = this.racersService.racers$.value[this.currentRacerIndex$.value];
    this.racersService.undoSkipRacer(skippedRacer);
    this.currentRacerSkipped = false;
  }

  public onPause() {
    this.isRacePaused$.next(true);
    this.isRaceStarted$.next(false);

    this.ittTimerSubscription?.unsubscribe();
    this.resetDeltaTimer();
  }

  public onReset() {
    this.ittTimerSubscription?.unsubscribe();

    this.repositoryService.resetLS();
    this.currentRaceService.resetCurrentRace();
    this.racersService.resetRacersData();
    this.finishersService.resetFinishersData();

    this.raceStatus$.next(RaceStatus.PREPARE);
  }

  public openResetDialog(content: any): void {
    this.dialogs.open(content, {size: 'auto'}).subscribe();
  }

  public openGoogleTableDialog(content: any): void {
    this.dialogs.open(content, {size: 'auto'}).subscribe();
  }

  public setStateFromJSON(data: ISyncJSON) {
    this.currentRaceService.setStateFromJSON(data);
    this.onContinuePrevRace();
  }

  public generateRacerNameAndNumberString(racer: IRacer) {
    if (racer === undefined || racer === null) return '';

    return this.racersService.generateRacerNameAndNumberString(racer);
  }

  public onContinuePrevRace() {
    this.currentRaceService.continuePrevRace();
    this.racersService.initRacersData();
    this.finishersService.initFinishersData();

    if (this.racersService.startedRacers.length > 0) {
      this.raceStatus$.next(RaceStatus.START);
    } else if (this.racersService.racers$.value.length > 0) {
      this.raceStatus$.next(RaceStatus.READY);
    }
  }

  public onSetDelta(newDelta: number): void {
    this.currentRaceService.setRacersDelta(newDelta);
    this.maxTimerValue = newDelta;
    this.currentTimerValue = newDelta;
  }

  public onRaceNameSave(raceName: string) {
    this.currentRaceService.updateRaceName(raceName);
  }

  public completeSteps(data: IGoogleTableData): void {
    this.setDataFromGoogleTable(data);
  }

  public onRaceTypeChanged($event: RaceType) {
    this.currentRaceService.raceType$.next($event);
  }
}
