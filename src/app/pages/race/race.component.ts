import { Component } from "@angular/core";
import {RacersService} from "../../services/racers.service";

@Component({
  selector: "app-race",
  templateUrl: "./race.component.html",
  styleUrls: ["./race.component.scss"]
})
export class RaceComponent {
  public starterNameList$ = this.racersService.starterNameList$;

  constructor(private racersService: RacersService) {}
}
