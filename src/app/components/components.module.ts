import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ModifyRacerComponent} from "./modify-racer/modify-racer.component";
import {CurrentRaceControlsComponent} from "./current-race-controls/current-race-controls.component";
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiHintModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/core";
import {TuiInputModule, TuiSelectModule} from "@taiga-ui/kit";
import {ReactiveFormsModule} from "@angular/forms";
import {TuiAutoFocusModule} from "@taiga-ui/cdk";
import { PrepareRaceControlsComponent } from './prepare-race-controls/prepare-race-controls.component';



@NgModule({
  declarations: [
    ModifyRacerComponent,
    CurrentRaceControlsComponent,
    PrepareRaceControlsComponent
  ],
  imports: [
    CommonModule,
    TuiButtonModule,
    TuiSvgModule,
    TuiHintModule,
    TuiInputModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiAutoFocusModule,
    TuiSelectModule,
    TuiDataListModule
  ],
  exports: [
    ModifyRacerComponent,
    CurrentRaceControlsComponent,
    PrepareRaceControlsComponent
  ]
})
export class ComponentsModule { }
