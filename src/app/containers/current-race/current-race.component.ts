import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from "@angular/core";
import {catchError, EMPTY, fromEvent, Subscription, switchMap, tap} from "rxjs";
import {RacersService} from "../../services/racers.service";
import {TuiDialogService} from "@taiga-ui/core";
import {RepositoryService} from "../../services/repository.service";
import {IRacer, ISyncJSON} from "../../models/interfaces";

@Component({
  selector: "app-current-race",
  templateUrl: "./current-race.component.html",
  styleUrls: ["./current-race.component.scss"]
})
export class CurrentRaceComponent implements AfterViewInit {
  private timerSubscription: Subscription | null = null;
  readonly max = this.racersService.racerSecondsDelta;
  public value = this.racersService.racerSecondsDelta;
  public timer$ = this.racersService.timer$.pipe(
    tap((value) => {
      this.value = value;
    })
  );

  public racers$ = this.racersService.racers$;
  public currentRacerIndex$ = this.racersService.currentRacerIndex$;
  public isRaceStarted$ = this.racersService.isRaceStarted$;
  public isRacePaused$ = this.racersService.isRacePaused$;
  public isAllMembersStarted$ = this.racersService.isAllMembersStarted$;
  public isAllMembersHasNumbers$ = this.racersService.isAllMembersHasNumbers$;
  public downloadJsonHref: any;

  @ViewChild("download") downloadLink: ElementRef<HTMLAnchorElement> | undefined;
  @ViewChild("fileInput") fileInput: ElementRef<HTMLInputElement> | undefined;

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private racersService: RacersService,
    private repositoryService: RepositoryService
  ) {
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
  }


  public onStart() {
    this.racersService.isRaceStarted$.next(true);
    this.timerSubscription = this.timer$.subscribe();
  }

  public onSkip() {
    const currentRacers = this.racers$.value.slice();
    const skippedRacer = currentRacers[this.currentRacerIndex$.value];

    if (skippedRacer.name === "Пропуск") return;

    currentRacers.push(skippedRacer);
    currentRacers[this.currentRacerIndex$.value].name = "Пропуск";

    this.racersService.racers$.next(currentRacers);
  }

  public onPause() {
    this.isRacePaused$.next(true);
    this.isRaceStarted$.next(false);

    this.timerSubscription?.unsubscribe();
  }

  public onReset() {
    this.repositoryService.resetLS();
    location.reload();
  }

  public showDialog(content: any): void {
    this.dialogs.open(content, {size: 'auto'}).subscribe();
  }

  public generateAndDownloadJSON() {
    var theJSON = JSON.stringify(this.repositoryService.collectRaceData());
    this.downloadLink?.nativeElement.setAttribute("href", "data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    this.downloadLink?.nativeElement.setAttribute("download", "sync-data.json");

    this.downloadLink?.nativeElement.click();
  }

  public setStateFromJSON(data: ISyncJSON) {
    this.repositoryService.setStateFromJSON(data);
  }

  public generateRacerNameAndNumberString(racer: IRacer) {
    return this.racersService.generateRacerNameAndNumberString(racer);
  }
}
