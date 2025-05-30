import {AfterViewInit, Component, ElementRef, Inject, TemplateRef, ViewChild} from "@angular/core";
import {catchError, EMPTY, finalize, fromEvent, Subscription, switchMap, tap} from "rxjs";
import {RacersService} from "../../services/racers.service";
import {TuiAlertService, TuiDialogService, TuiNotification} from "@taiga-ui/core";
import {RepositoryService} from "../../services/repository.service";
import {IRacer, ISyncJSON} from "../../models/interfaces";
import {FormControl, Validators} from "@angular/forms";
import {FinishersService} from "../../services/finishers.service";
import {SKIPPED_RACER_NAME} from "../../constants/itt.constants";
import {GoogleTableService} from "../../services/google-table.service";

enum Mode {
  prepare = 'prepare',
  pause = 'pause',
  start = 'start',
  finish = 'finish',
  ready = 'ready',
}

@Component({
  selector: "app-current-race",
  templateUrl: "./current-race.component.html",
  styleUrls: ["./current-race.component.scss"]
})
export class CurrentRaceComponent implements AfterViewInit {
  protected readonly SKIPPED_RACER_NAME = SKIPPED_RACER_NAME;
  private timerSubscription: Subscription | null = null;
  readonly Mode = Mode;
  public max = this.racersService.racerSecondsDelta;
  public value = this.racersService.racerSecondsDelta;

  /**
   * Состояние компонента
   */
  public mode = Mode.prepare;
  public isRaceNameEditing = false;
  public currentStepperIndex = 0;

  /**
   * Потоки
   */
  public currentRacerIndex$ = this.racersService.currentRacerIndex$;
  public isRaceStarted$ = this.racersService.isRaceStarted$;
  public isRacePaused$ = this.racersService.isRacePaused$;
  public isAllMembersStarted$ = this.racersService.isAllMembersStarted$;
  public isAllMembersHasNumbers$ = this.racersService.isAllMembersHasNumbers$;
  public raceName$ = this.racersService.raceName$;
  public timer$ = this.racersService.timer$.pipe(
    tap((value) => {
      this.value = value;
    })
  );
  public racers$ = this.racersService.racers$.pipe(
    tap((racers) => {
      if (racers.length > 0) this.mode = Mode.ready;
    })
  );

  public downloadJsonHref: string = '';
  public raceNameFormControl = new FormControl('', Validators.required);
  public deltaFormControl = new FormControl(this.racersService.racerSecondsDelta, Validators.required);

  /**
   * Google Таблицы
   */
  public googleTableSheetUrlControl = new FormControl("", Validators.required);
  public googleTableSheetData: Record<string, string>[] = []
  public googleTableSheetKeys: string[] = [];
  public googleTableSheetKeyMap: Record<string, string> = {}
  public isGoogleTableSheetLoading: boolean = false;

  @ViewChild("download") downloadLink: ElementRef<HTMLAnchorElement> | undefined;
  @ViewChild("fileInput") fileInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('newRace') newRace: TemplateRef<any> | undefined;

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    private racersService: RacersService,
    private repositoryService: RepositoryService,
    private finishersService: FinishersService,
    private googleTableService: GoogleTableService,
  ) {
  }

  private resetDeltaTimer() {
    this.value = this.racersService.racerSecondsDelta;
  }

  private setDataFromGoogleTable(): void {
    const { name, category } = this.googleTableSheetKeyMap
    this.racersService.setRacersFromGoogleSheet(this.googleTableSheetData, name, category);
  }

  public ngAfterViewInit(): void {
    /**
     *  Хэндлер на загрузку состояния из JSON
     */
    if (this.fileInput !== undefined) {
      fromEvent(this.fileInput.nativeElement, 'change').pipe(
        switchMap(event => {
          const file = (event.target as HTMLInputElement).files![0];
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
        }),
        tap((jsonString) => {
          this.setStateFromJSON(JSON.parse(jsonString));
        }),
        catchError((error: Error) => {
          console.warn(error)

          return EMPTY;
        })
      ).subscribe();
    }

    if (this.repositoryService.checkRacers()) {
      this.dialogs.open(this.newRace, {size: 'auto'}).subscribe();
    }
    else {
      this.onReset();
    }

    this.racersService.isDeltaChanged$.pipe(
      tap(() => {
        const currentDelta = this.racersService.racerSecondsDelta;

        this.max = currentDelta;
        this.value = currentDelta;
      })
    ).subscribe()
  }

  /**
   * TODO: Вынести блок кнопок в отдельный компонент
   */
  public onStart() {
    this.racersService.isRaceStarted$.next(true);
    this.timerSubscription = this.timer$.subscribe();
  }

  public onSkip() {
    const currentRacers = this.racersService.racers$.value.slice();
    const skippedRacer = currentRacers[this.currentRacerIndex$.value];

    if (skippedRacer.name === SKIPPED_RACER_NAME) return;

    currentRacers.push(skippedRacer);
    currentRacers[this.currentRacerIndex$.value].name = SKIPPED_RACER_NAME;

    this.racersService.racers$.next(currentRacers);
  }

  public onPause() {
    this.isRacePaused$.next(true);
    this.isRaceStarted$.next(false);

    this.timerSubscription?.unsubscribe();
    this.resetDeltaTimer();
  }

  public onReset() {
    this.timerSubscription?.unsubscribe();

    this.repositoryService.resetLS();
    this.racersService.resetRace();
    this.finishersService.resetFinishersData();

    this.mode = Mode.prepare;
  }

  public openResetDialog(content: any): void {
    this.dialogs.open(content, {size: 'auto'}).subscribe();
  }

  public openGoogleTableDialog(content: any): void {
    this.dialogs.open(content, {size: 'auto'}).subscribe();
  }

  public generateAndDownloadJSON() {
    var theJSON = JSON.stringify(this.repositoryService.collectRaceData());
    this.downloadLink?.nativeElement.setAttribute("href", "data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    this.downloadLink?.nativeElement.setAttribute("download", "sync-data.json");

    this.downloadLink?.nativeElement.click();
  }

  public setStateFromJSON(data: ISyncJSON) {
    this.racersService.setStateFromJSON(data);
    this.onContinuePrevRace();
  }

  public generateRacerNameAndNumberString(racer: IRacer) {
    if (racer === undefined || racer === null) return;

    return this.racersService.generateRacerNameAndNumberString(racer);
  }

  public onContinuePrevRace() {
    this.racersService.continuePrevRace();
    this.mode = Mode.ready
  }

  public onGetGoogleTableData() {
    this.googleTableSheetUrlControl.disable()
    this.isGoogleTableSheetLoading = true;

    const url = this.googleTableSheetUrlControl.value;

    if (typeof url === "string" && url.startsWith('http')) {
      const id = this.googleTableService.extractGoogleSheetId(url);

      if (id !== null) {
        this.googleTableService.getSheetData(id).pipe(
          tap((data) => {
            if (data && data.length > 0) {
              this.googleTableSheetData = data;
              this.googleTableSheetKeys = Object.keys(data[0]);
            }
          }),
          finalize(() => {
            this.nextStep();
            this.isGoogleTableSheetLoading = false;
            this.googleTableSheetUrlControl.enable();
            this.googleTableSheetUrlControl.reset();
          })
        ).subscribe();

        return;
      }
    }

    this.showGoogleTableAlert();
    this.isGoogleTableSheetLoading = false;
    this.googleTableSheetUrlControl.enable();
  }

  public onGoogleCellClick(index: number, cellName: string) {
    this.googleTableSheetKeyMap[cellName] = this.googleTableSheetKeys[index];
    this.googleTableSheetKeys.splice(index, 1);
  }

  public showGoogleTableAlert(): void {
    this.alerts
      .open(
        'Не удалось получить данные из <strong>Google Таблицы</strong>.<br> Проверьте <strong>URL</strong>',
        { label: 'Ошибка!', status: TuiNotification.Error, autoClose: false })
      .subscribe();
  }

  public onRaceNameClick(): void {
    this.raceNameFormControl.patchValue(this.raceName$.value)
    this.isRaceNameEditing = true
  }

  public onSetDelta(): void {
    const delta = this.deltaFormControl.value;

    if (delta === undefined || delta === null) return;

    this.racersService.setRacersDelta(delta);
    this.max = delta;
    this.value = delta;
  }

  public openDeltaDialog(content: any): void {
    this.dialogs.open(content, {size: 'auto'}).subscribe();
  }

  public onRaceNameSave() {
    const raceName = this.raceNameFormControl.value;

    if (raceName !== null) {
      this.racersService.updateRaceName(raceName);
      this.raceNameFormControl.reset();
      this.isRaceNameEditing = false
    }
  }

  public nextStep(): void {
    this.currentStepperIndex = this.currentStepperIndex + 1;
  }

  public completeSteps(): void {
    this.nextStep();
    this.setDataFromGoogleTable();
    this.currentStepperIndex = 0;
  }
}
