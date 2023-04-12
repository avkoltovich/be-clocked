import { Component } from "@angular/core";
import { RacersService } from "../../services/racers.service";

@Component({
  selector: "app-racer-list",
  templateUrl: "./racer-list.component.html",
  styleUrls: ["./racer-list.component.scss"]
})
export class RacerListComponent {
  constructor(private racersService: RacersService) {
  }

  public list = this.racersService.registeredRacers$;

  remove(i: number) {
    const currentList = this.racersService.registeredRacers$.value.slice();
    currentList.splice(i, 1);
    this.racersService.registeredRacers$.next(currentList);
  }

  up(i: number) {
    const currentList = this.racersService.registeredRacers$.value.slice();
    let swap = currentList[i];
    currentList[i] = currentList[i - 1];
    currentList[i - 1] = swap;
    this.racersService.registeredRacers$.next(currentList);
  }

  down(i: number) {
    const currentList = this.racersService.registeredRacers$.value.slice();
    let swap = currentList[i];
    currentList[i] = currentList[i + 1];
    currentList[i + 1] = swap;
    this.racersService.registeredRacers$.next(currentList);
  }
}
