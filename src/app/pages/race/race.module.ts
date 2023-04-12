import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddRacerComponent } from "./components/add-racer/add-racer.component";
import { RacerListComponent } from "./components/racer-list/racer-list.component";
import { CurrentRaceComponent } from "./components/current-race/current-race.component";
import { FinishRaceComponent } from "./components/finish-race/finish-race.component";
import { RaceComponent } from "./components/race/race.component";


@NgModule({
  declarations: [
    AddRacerComponent,
    RacerListComponent,
    CurrentRaceComponent,
    FinishRaceComponent,
    RaceComponent
  ],
  imports: [
    CommonModule
  ]
})
export class RaceModule {
}
