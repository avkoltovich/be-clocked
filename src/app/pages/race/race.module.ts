import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddRacerComponent } from "./components/add-racer/add-racer.component";
import { RacerListComponent } from "./components/racer-list/racer-list.component";
import { CurrentRaceComponent } from "./components/current-race/current-race.component";
import { FinishRaceComponent } from "./components/finish-race/finish-race.component";
import { RaceComponent } from "./components/race/race.component";
import { RaceRoutingModule } from "./race-routing.module";
import { TuiInputModule, TuiIslandModule, TuiProgressModule } from "@taiga-ui/kit";
import { TuiButtonModule, TuiSvgModule } from "@taiga-ui/core";
import { TuiReorderModule } from "@taiga-ui/addon-table";
import { RacersService } from "./services/racers.service";
import { ReactiveFormsModule } from "@angular/forms";
import { TuiLetModule } from "@taiga-ui/cdk";


@NgModule({
  declarations: [
    AddRacerComponent,
    RacerListComponent,
    CurrentRaceComponent,
    FinishRaceComponent,
    RaceComponent
  ],
  imports: [
    CommonModule,
    RaceRoutingModule,
    TuiIslandModule,
    TuiInputModule,
    TuiButtonModule,
    TuiSvgModule,
    TuiReorderModule,
    TuiProgressModule,
    ReactiveFormsModule,
    TuiLetModule
  ],
  providers: [
    RacersService
  ]
})
export class RaceModule {
}
