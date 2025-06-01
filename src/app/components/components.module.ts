import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModifyRacerComponent} from "./modify-racer/modify-racer.component";
import {RaceControlsComponent} from "./race-controls/race-controls.component";
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiHintModule,
  TuiLinkModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/core";
import {TuiInputModule, TuiProgressModule, TuiSelectModule} from "@taiga-ui/kit";
import {ReactiveFormsModule} from "@angular/forms";
import {TuiAutoFocusModule, TuiLetModule} from "@taiga-ui/cdk";
import {IttRaceProgressComponent} from './itt-race-progress/itt-race-progress.component';


@NgModule({
  declarations: [
    ModifyRacerComponent,
    RaceControlsComponent,
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
        RaceControlsComponent,
        IttRaceProgressComponent
    ]
})
export class ComponentsModule { }
