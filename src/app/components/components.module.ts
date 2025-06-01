import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {RacerEditorComponent} from "./racer-editor/racer-editor.component";
import {RaceControlsComponent} from "./race-controls/race-controls.component";
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiHintModule,
  TuiLinkModule, TuiLoaderModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/core";
import {
  TuiInputModule,
  TuiInputNumberModule,
  TuiProgressModule,
  TuiSelectModule,
  TuiStepperModule
} from "@taiga-ui/kit";
import {ReactiveFormsModule} from "@angular/forms";
import {TuiAutoFocusModule, TuiLetModule} from "@taiga-ui/cdk";
import {IttRaceProgressComponent} from './itt-race-progress/itt-race-progress.component';
import { RaceHeaderComponent } from './race-header/race-header.component';
import { GoogleTableStepperComponent } from './google-table-stepper/google-table-stepper.component';


@NgModule({
  declarations: [
    RacerEditorComponent,
    RaceControlsComponent,
    IttRaceProgressComponent,
    RaceHeaderComponent,
    GoogleTableStepperComponent
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
    TuiProgressModule,
    NgOptimizedImage,
    TuiLoaderModule,
    TuiStepperModule,
    TuiInputNumberModule
  ],
  exports: [
    RacerEditorComponent,
    RaceControlsComponent,
    IttRaceProgressComponent,
    RaceHeaderComponent,
    GoogleTableStepperComponent
  ]
})
export class ComponentsModule { }
