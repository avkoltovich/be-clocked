import {AfterViewInit, Component, ElementRef, Inject, TemplateRef, ViewChild} from "@angular/core";
import {catchError, EMPTY, fromEvent, Subscription, switchMap, tap} from "rxjs";
import {RacersService} from "../../services/racers.service";
import {TuiAlertService, TuiDialogService, TuiNotification} from "@taiga-ui/core";
import {RepositoryService} from "../../services/repository.service";
import {IRacer, ISyncJSON} from "../../models/interfaces";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FinishersService} from "../../services/finishers.service";
import {SKIPPED_RACER_NAME} from "../../constants/itt.constants";

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
  public raceName$ = this.racersService.raceName$;
  public timer$ = this.racersService.timer$.pipe(
    tap((value) => {
      this.value = value;
    })
  );

  public mode = Mode.prepare;
  public isRaceNameEditing = false;

  public racers$ = this.racersService.racers$.pipe(
    tap((racers) => {
      if (racers.length > 0) this.mode = Mode.ready;
    })
  );
  public currentRacerIndex$ = this.racersService.currentRacerIndex$;
  public isRaceStarted$ = this.racersService.isRaceStarted$;
  public isRacePaused$ = this.racersService.isRacePaused$;
  public isAllMembersStarted$ = this.racersService.isAllMembersStarted$;
  public isAllMembersHasNumbers$ = this.racersService.isAllMembersHasNumbers$;
  public downloadJsonHref: any;

  public googleTableForm: FormGroup = new FormGroup({
    googleTableUrl: new FormControl("", Validators.required),
    name: new FormControl("", Validators.required),
    category: new FormControl("", Validators.required),
  })
  public raceNameFormControl = new FormControl('', Validators.required);
  public deltaFormControl = new FormControl(this.racersService.racerSecondsDelta, Validators.required);

  @ViewChild("download") downloadLink: ElementRef<HTMLAnchorElement> | undefined;
  @ViewChild("fileInput") fileInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('newRace', {read: TemplateRef})
  newRace: TemplateRef<any> | undefined;

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    private racersService: RacersService,
    private repositoryService: RepositoryService,
    private finishersService: FinishersService
  ) {
  }

  private resetDeltaTimer() {
    this.value = this.racersService.racerSecondsDelta;
  }

  private checkIsString(...args: any[]) {
    let isString = true;
    args.forEach(arg => {isString = isString && typeof arg === "string"})

    return isString;
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
    const url = this.googleTableForm.controls['googleTableUrl'].value;
    const name = this.googleTableForm.controls['name'].value;
    const category = this.googleTableForm.controls['category'].value;

    if (this.checkIsString(url, name, category) && url.startsWith('http')) {
      this.racersService.readRacersFromGoogleSheet(url, name, category).pipe(
        tap(({ racers, categoriesMap }) => {
          if (racers.length === 0 || Object.keys(categoriesMap).length === 0) {
            this.showGoogleTableAlert();
          } else {
            this.mode = Mode.ready;
            this.googleTableForm.reset();
          }
        })
      ).subscribe();
    }
  }

  public showGoogleTableAlert(): void {
    this.alerts
      .open('Не удалось получить данные из <strong>Google Таблицы</strong>.<br> Проверьте <strong>URL</strong> и название <strong>столбцов</strong>', { label: 'Ошибка!', status: TuiNotification.Error, autoClose: false })
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
}
