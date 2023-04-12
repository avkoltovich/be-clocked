import { Component } from "@angular/core";
import { tap } from "rxjs";
import { RacersService } from "../../services/racers.service";

@Component({
  selector: "app-current-race",
  templateUrl: "./current-race.component.html",
  styleUrls: ["./current-race.component.scss"]
})
export class CurrentRaceComponent {
  readonly max = this.racersService.secondsDelta;
  public value = this.racersService.secondsDelta;
  public timer$ = this.racersService.timer$.pipe(
    tap((value) => {
      this.value = value;
    })
  );


  public racers$ = this.racersService.racers$;
  public currentRacerIndex$ = this.racersService.currentRacerIndex$;
  public isRaceStarted$ = this.racersService.isRaceStarted$;
  public isAllMembersStarted$ = this.racersService.isAllMembersStarted$;

  constructor(private racersService: RacersService) {

  }

  public onStart() {
    this.racersService.raceStartTime = Date.now();
    this.racersService.isRaceStarted$.next(true);
    this.timer$.subscribe();
  }

  public onCancel() {
    const currentRacers = this.racers$.value.slice();
    const skippedRacer = currentRacers[this.currentRacerIndex$.value];

    if (skippedRacer === "Пропуск") return;

    currentRacers.push(skippedRacer);
    currentRacers[this.currentRacerIndex$.value] = "Пропуск";

    this.racersService.racers$.next(currentRacers);
  }
}
