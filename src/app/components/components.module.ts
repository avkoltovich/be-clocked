import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ModifyRacerComponent} from "./modify-racer/modify-racer.component";
import {CurrentRaceControlsComponent} from "./current-race-controls/current-race-controls.component";
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiHintModule, TuiLinkModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/core";
import {TuiInputModule, TuiProgressModule, TuiSelectModule} from "@taiga-ui/kit";
import {ReactiveFormsModule} from "@angular/forms";
import {TuiAutoFocusModule, TuiLetModule} from "@taiga-ui/cdk";
import { PrepareRaceControlsComponent } from './prepare-race-controls/prepare-race-controls.component';
import { IttRaceProgressComponent } from './itt-race-progress/itt-race-progress.component';



@NgModule({
  declarations: [
    ModifyRacerComponent,
    CurrentRaceControlsComponent,
    PrepareRaceControlsComponent,
    IttRaceProgressComponent
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
    TuiDataListModule,
    TuiLetModule,
    TuiLinkModule,
    TuiProgressModule
  ],
    exports: [
        ModifyRacerComponent,
        CurrentRaceControlsComponent,
        PrepareRaceControlsComponent,
        IttRaceProgressComponent
    ]
})
export class ComponentsModule { }
