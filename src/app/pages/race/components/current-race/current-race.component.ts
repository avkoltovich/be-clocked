import { Component, Inject } from "@angular/core";
import { map, of, startWith, takeWhile, timer } from "rxjs";
import { TUI_IS_CYPRESS } from "@taiga-ui/cdk";

@Component({
  selector: "app-current-race",
  templateUrl: "./current-race.component.html",
  styleUrls: ["./current-race.component.scss"]
})
export class CurrentRaceComponent {
  readonly max = 100;
  readonly value$ = this.isCypress
    ? of(30)
    : timer(300, 200).pipe(
      map(i => i + 30),
      startWith(30),
      takeWhile(value => value <= this.max)
    );

  constructor(@Inject(TUI_IS_CYPRESS) private readonly isCypress: boolean) {
  }
}
