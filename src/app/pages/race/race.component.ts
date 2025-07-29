import { Component } from "@angular/core";
import {RacersService} from "../../services/racers.service";
import {CurrentRaceService} from "../../services/current-race.service";
import {RaceType} from "../../models/enums";

@Component({
  selector: "app-race",
  templateUrl: "./race.component.html",
  styleUrls: ["./race.component.scss"]
})
export class RaceComponent {
  public starterNameList$ = this.racersService.starterNameList$;
  public isRaceBeginning$ = this.currentRaceService.isRaceBeginning$;
  public raceType$ = this.currentRaceService.raceType$

  constructor(private racersService: RacersService, private currentRaceService: CurrentRaceService) {}

  protected readonly RaceType = RaceType;
}
