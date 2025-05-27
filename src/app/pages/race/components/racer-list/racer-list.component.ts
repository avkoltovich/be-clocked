import { Component } from "@angular/core";
import { RacersService } from "../../services/racers.service";

@Component({
  selector: "app-racer-list",
  templateUrl: "./racer-list.component.html",
  styleUrls: ["./racer-list.component.scss"]
})
export class RacerListComponent {
  public currentRacerIndex$ = this.racersService.currentRacerIndex$;
  public isRaceStarted$ = this.racersService.isRaceStarted$;
  public racers$ = this.racersService.racers$;

  constructor(private racersService: RacersService) {
  }

  /**
   * TODO: Переписать метод таким образом, чтобы вызывалось редактирование имени
   */
  public edit(i: number, racer: string) {
    const currentList = this.racersService.racers$.value.slice();
    console.log(i, currentList);
  }

  public remove(i: number) {
    const currentList = this.racersService.racers$.value.slice();
    currentList.splice(i, 1);
    this.racersService.racers$.next(currentList);
  }

  public up(i: number) {
    const currentList = this.racersService.racers$.value.slice();
    let swap = currentList[i];
    currentList[i] = currentList[i - 1];
    currentList[i - 1] = swap;
    this.racersService.racers$.next(currentList);
  }

  public down(i: number) {
    const currentList = this.racersService.racers$.value.slice();
    let swap = currentList[i];
    currentList[i] = currentList[i + 1];
    currentList[i + 1] = swap;
    this.racersService.racers$.next(currentList);
  }
}
