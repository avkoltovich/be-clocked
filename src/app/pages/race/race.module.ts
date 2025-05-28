import {NgModule} from "@angular/core";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {AddRacerComponent} from "../../containers/add-racer/add-racer.component";
import {RacerListComponent} from "../../containers/racer-list/racer-list.component";
import {CurrentRaceComponent} from "../../containers/current-race/current-race.component";
import {FinishRaceComponent} from "../../containers/finish-race/finish-race.component";
import {RaceComponent} from "./race.component";
import {RaceRoutingModule} from "./race-routing.module";
import {
  TuiDataListWrapperModule,
  TuiInputModule,
  TuiInputNumberModule,
  TuiIslandModule,
  TuiProgressModule,
  TuiSelectModule
} from "@taiga-ui/kit";
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiLinkModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/core";
import {TuiReorderModule} from "@taiga-ui/addon-table";
import {RacersService} from "../../services/racers.service";
import {ReactiveFormsModule} from "@angular/forms";
import {TuiLetModule} from "@taiga-ui/cdk";
import {HttpClientModule} from "@angular/common/http";
import {ModifyRacerComponent} from "../../components/modify-racer/modify-racer.component";


@NgModule({
  declarations: [
    AddRacerComponent,
    RacerListComponent,
    CurrentRaceComponent,
    FinishRaceComponent,
    RaceComponent,
    ModifyRacerComponent
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
        TuiLetModule,
        HttpClientModule,
        TuiDataListModule,
        TuiLinkModule,
        TuiInputNumberModule,
        NgOptimizedImage,
        TuiSelectModule,
        TuiDataListWrapperModule,
        TuiTextfieldControllerModule,
    ],
  providers: [
    RacersService
  ]
})
export class RaceModule {
}
