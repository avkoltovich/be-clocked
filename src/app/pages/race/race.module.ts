import {NgModule} from "@angular/core";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {AddRacerComponent} from "../../containers/add-racer/add-racer.component";
import {RacerListComponent} from "../../containers/racer-list/racer-list.component";
import {CurrentRaceComponent} from "../../containers/current-race/current-race.component";
import {FinishRaceComponent} from "../../containers/finish-race/finish-race.component";
import {RaceComponent} from "./race.component";
import {RaceRoutingModule} from "./race-routing.module";
import {
  TuiBadgeModule,
  TuiDataListWrapperModule,
  TuiInputModule,
  TuiInputNumberModule,
  TuiIslandModule,
  TuiProgressModule,
  TuiStepperModule
} from "@taiga-ui/kit";
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiHintModule,
  TuiLinkModule,
  TuiLoaderModule,
  TuiNotificationModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/core";
import {TuiReorderModule} from "@taiga-ui/addon-table";
import {ReactiveFormsModule} from "@angular/forms";
import {TuiLetModule} from "@taiga-ui/cdk";
import {HttpClientModule} from "@angular/common/http";
import {ComponentsModule} from "../../components/components.module";


@NgModule({
  declarations: [
    AddRacerComponent,
    RacerListComponent,
    CurrentRaceComponent,
    FinishRaceComponent,
    RaceComponent,
  ],
  imports: [
    ComponentsModule,
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
    TuiLinkModule,
    TuiInputNumberModule,
    NgOptimizedImage,
    TuiDataListWrapperModule,
    TuiTextfieldControllerModule,
    TuiNotificationModule,
    TuiHintModule,
    TuiBadgeModule,
    TuiStepperModule,
    TuiLoaderModule,
    TuiDataListModule,
  ]
})
export class RaceModule {
}
