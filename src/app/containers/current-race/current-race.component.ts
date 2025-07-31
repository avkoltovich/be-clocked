import {AfterViewInit, Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {BehaviorSubject, combineLatest, Subscription, takeUntil, tap} from "rxjs";
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
  styleUrls: ["./current-race.component.scss"],
  providers: [TuiDestroyService],
})
export class CurrentRaceComponent implements AfterViewInit, OnDestroy, OnInit {
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
  public raceName$ = this.currentRaceService.raceName$;
  public raceType$ = this.currentRaceService.raceType$;
  public isRaceBeginning$ = this.currentRaceService.isRaceBeginning$;
  public isRaceEnded$ = this.currentRaceService.isRaceEnded$;

  /**
   * Для ITT режима
   */
  public ittRaceTimer$ = this.currentRaceService.ittRaceTimer$.pipe(
    tap((value) => {
      this.currentTimerValue = value;
    })
  );
  /**
   * Для Группового режима
   */
  private startTime$ = this.currentRaceService.raceStartTime$;
  private endTime$ = this.currentRaceService.raceEndTime$;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  public currentGroupRaceTime$ = new BehaviorSubject('0:00:00');

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
    const {tableKeys, tableData} = data
    const {name, category} = tableKeys;
    this.racersService.setRacersFromGoogleSheet(tableData, name, category);
  }

  public ngOnInit(): void {
    combineLatest([
      this.isRaceEnded$,
      this.raceType$
    ]).pipe(
      tap(([ isRaceEnded, raceType ]) => {
        if (raceType === RaceType.GROUP && isRaceEnded) {
          this.currentGroupRaceTime$.next(this.formatTime());
        }
      })
    ).subscribe();

    this.finishersService.isAllFinished$.pipe(
      tap((isAllFinished) => {
        if (isAllFinished) this.onStop()
      })
    ).subscribe();
  }

  public ngAfterViewInit(): void {
    if (this.raceType$.value === RaceType.GROUP && this.startTime$.value !== null && !this.isRaceEnded$.value) {
      this.currentRaceService.setRaceBeginning(true);
      this.startTimer();
    }

    if (this.racersService.racers$.value.length > 0) {
      this.dialogs.open(this.newRace, {size: 'auto'}).subscribe();
    } else {
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
      this.currentRaceService.setRaceBeginning(true);
      this.ittTimerSubscription = this.ittRaceTimer$.subscribe();
      this.currentRaceService.isRacePaused$.next(false);
    }

    if (this.raceType$.value === RaceType.GROUP) {
      const startTime = Date.now();
      this.currentRaceService.updateRaceStartTime(startTime);
      this.currentRaceService.startGroupRace(startTime);
      this.racersService.startAllRacers(startTime);
      this.currentRaceService.setRaceBeginning(true);
      this.startTimer();
    }
  }

  public onStop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.racersService.dnfRacers();
    this.currentRaceService.endGroupRace()
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
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.ittTimerSubscription?.unsubscribe();
    this.currentRaceService.resetCurrentRace();
    this.racersService.resetRacersData();
    this.finishersService.resetFinishersData();
    this.raceStatus$.next(RaceStatus.PREPARE);
    this.currentRaceService.updateRaceStartTime(null);
    this.repositoryService.resetLS();

    if (this.raceType$.value === RaceType.GROUP) {
      this.currentGroupRaceTime$.next(this.formatTime());
    }
  }

  public openResetDialog(content: any): void {
    this.dialogs.open(content, {size: 'auto'}).subscribe();
  }

  public openGoogleTableDialog(content: any): void {
    this.dialogs.open(content, {size: 'auto'}).subscribe();
  }

  public setStateFromJSON(data: ISyncJSON) {
    this.currentRaceService.setStateFromJSON(data);
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

    if (this.raceType$.value === RaceType.ITT && this.isRaceBeginning$.value) {
      this.onStart();
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
    this.currentRaceService.updateRaceType($event);
    this.repositoryService.updateRaceType($event);
  }

  private formatTime(): string {
    let totalSeconds = 0;

    if (this.isRaceEnded$.value) totalSeconds = Math.floor((this.endTime$.value! - this.startTime$.value!) / 1000)
    if (this.isRaceBeginning$.value) totalSeconds = Math.floor((Date.now() - this.startTime$.value!) / 1000)

    if (totalSeconds <= 0) return '0:00:00';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private startTimer() {
    this.intervalId = setInterval(() => {
      this.currentGroupRaceTime$.next(this.formatTime());
    }, 1000);
  }

  public ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
