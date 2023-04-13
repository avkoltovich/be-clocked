import { Component } from "@angular/core";
import { Subscription, tap } from "rxjs";
import { RacersService } from "../../services/racers.service";

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

  constructor(private racersService: RacersService) {

  }

  public onStart() {
    this.racersService.storeStartTimeInLS(Date.now());
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
}
