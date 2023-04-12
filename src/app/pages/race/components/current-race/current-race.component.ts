import { Component } from "@angular/core";
import { tap } from "rxjs";
import { RacersService } from "../../services/racers.service";

@Component({
  selector: "app-current-race",
  templateUrl: "./current-race.component.html",
  styleUrls: ["./current-race.component.scss"]
})
export class CurrentRaceComponent {
  private count = 0;
  readonly max = 30;
  public value = 30;
  public timer$ = this.racersService.timer$.pipe(
    tap((value) => {
      this.value = value;
    })
  );
  public racers$ = this.racersService.registeredRacers$;
  public isRaceStarted$ = this.racersService.isRaceStarted$;
  public isAllMembersStarted$ = this.racersService.isAllMembersStarted$;

  constructor(private racersService: RacersService) {
  }

  public onStart() {
    this.racersService.raceStartTime = Date.now();
    this.racersService.isRaceStarted$.next(true);
    this.timer$.subscribe();
  }
}
