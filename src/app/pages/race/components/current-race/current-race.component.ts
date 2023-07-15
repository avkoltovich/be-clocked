import { Component, ElementRef, Inject, ViewChild } from "@angular/core";
import { Subscription, tap } from "rxjs";
import { RacersService } from "../../services/racers.service";
import { TuiDialogService } from "@taiga-ui/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-current-race",
  templateUrl: "./current-race.component.html",
  styleUrls: ["./current-race.component.scss"]
})
export class CurrentRaceComponent {
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
  public downloadJsonHref: any;

  @ViewChild("download") downloadLink: ElementRef<HTMLInputElement> | undefined;

  constructor(@Inject(TuiDialogService) private readonly dialogs: TuiDialogService, private racersService: RacersService, private sanitizer: DomSanitizer) {

  }

  public onStart() {
    this.racersService.isRaceStarted$.next(true);
    this.timerSubscription = this.timer$.subscribe();
  }

  public onSkip() {
    const currentRacers = this.racers$.value.slice();
    const skippedRacer = currentRacers[this.currentRacerIndex$.value];

    if (skippedRacer === "Пропуск") return;

    currentRacers.push(skippedRacer);
    currentRacers[this.currentRacerIndex$.value] = "Пропуск";

    this.racersService.racers$.next(currentRacers);
  }

  public onPause() {
    this.isRacePaused$.next(true);
    this.isRaceStarted$.next(false);

    this.timerSubscription?.unsubscribe();
  }

  public onReset() {
    this.racersService.resetLS();
    location.reload();
  }

  public showDialog(content: any): void {
    this.dialogs.open(content).subscribe();
  }

  public generateAndDownloadJSON() {
    var theJSON = JSON.stringify(this.racersService.collectDataFromLS());
    this.downloadLink?.nativeElement.setAttribute("href", "data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    this.downloadLink?.nativeElement.setAttribute("download", "sync-data.json");

    this.downloadLink?.nativeElement.click();
  }

  public setStateFromJSON() {
    this.racersService.setStateFromJSON();
  }
}
