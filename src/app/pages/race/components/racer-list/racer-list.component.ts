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

  public list = this.racersService.racers$;

  remove(i: number) {
    const currentList = this.racersService.racers$.value.slice();
    currentList.splice(i, 1);
    this.racersService.racers$.next(currentList);
  }

  up(i: number) {

  }

  down(i: number) {

  }
}
