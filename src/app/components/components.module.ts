import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RacerEditorComponent} from "./racer-editor/racer-editor.component";
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
    RacerEditorComponent,
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
        RacerEditorComponent,
        RaceControlsComponent,
        IttRaceProgressComponent
    ]
})
export class ComponentsModule { }
