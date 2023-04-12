import { Component } from "@angular/core";
import { map, tap, timer } from "rxjs";
import { RacersService } from "../../services/racers.service";

@Component({
  selector: "app-current-race",
  templateUrl: "./current-race.component.html",
  styleUrls: ["./current-race.component.scss"]
})
export class CurrentRaceComponent {
  readonly max = 30;
  private count = 0;
  readonly value$ = timer(0, 1000).pipe(
    map(i => 30 - i + this.count),
    tap((value) => {
      if (value === 0) {
        this.count += 30;
        const currentList = this.racersService.racers$.value.slice(1);
        this.racersService.racers$.next(currentList);
      }
    })
  );

  constructor(private racersService: RacersService) {
  }

  public racers$ = this.racersService.racers$;
}
