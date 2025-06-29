import {Injectable} from '@angular/core';
import {RepositoryService} from "./repository.service";
import {FinishersService} from "./finishers.service";
import {RacersService} from "./racers.service";
import {ISyncJSON} from "../models/interfaces";

@Injectable({
  providedIn: 'root'
})
export class CurrentRaceService {

  constructor(private repositoryService: RepositoryService, private finishersService: FinishersService, private racersService: RacersService) {
  }

  public initRaceData() {
    this.racersService.initRaceData()
    this.finishersService.initFinishersData()
  }

  public setStateFromJSON(data: ISyncJSON) {
    this.repositoryService.setStateFromJSON(data);
    this.initRaceData()
  }
}
