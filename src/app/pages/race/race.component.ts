import { Component } from "@angular/core";
import {RacersService} from "../../services/racers.service";
import {CurrentRaceService} from "../../services/current-race.service";
import {RaceType} from "../../models/enums";
import {FinishersService} from "../../services/finishers.service";

@Component({
  selector: "app-race",
  templateUrl: "./race.component.html",
  styleUrls: ["./race.component.scss"]
})
export class RaceComponent {
  public racers$ = this.racersService.racers$;

  public finishers$ = this.finisherService.finishers$;

  public isRaceBeginning$ = this.currentRaceService.isRaceBeginning$;

  public isRaceEnded$ = this.currentRaceService.isRaceEnded$;

  public raceType$ = this.currentRaceService.raceType$

  constructor(private racersService: RacersService, private currentRaceService: CurrentRaceService, private finisherService: FinishersService) {}

  protected readonly RaceType = RaceType;
}
