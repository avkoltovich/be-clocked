import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import {DEFAULT_DELTA} from "../../constants/itt.constants";
import {FormControl, Validators} from "@angular/forms";
import {TuiDialogService} from "@taiga-ui/core";

@Component({
  selector: 'app-itt-race-progress',
  templateUrl: './itt-race-progress.component.html',
  styleUrls: ['./itt-race-progress.component.scss']
})
export class IttRaceProgressComponent {
  @Input() currentRacer = '';

  @Input() isSkippedRacer = false;

  @Input() nextRacer = '';

  @Input() isRacersListEmpty = true;

  @Input() isShowRacerNames = true;

  @Input() isShowTimer = true;

  @Input() isDeltaEditMode = true;

  @Input() currentTimerValue: number = DEFAULT_DELTA;

  @Input() maxTimerValue: number = DEFAULT_DELTA;

  @Input() isShowEmptyRacerListNotification = true;

  @Output() newDelta= new EventEmitter();

  public deltaFormControl = new FormControl(this.currentTimerValue, Validators.required);

  constructor(@Inject(TuiDialogService) private readonly dialogs: TuiDialogService) {
  }

  public openDeltaDialog(content: any): void {
    this.deltaFormControl.setValue(this.currentTimerValue);
    this.dialogs.open(content, {size: 'auto'}).subscribe();
  }

  public onSetDelta(): void {
    const newDelta = this.deltaFormControl.value;

    if (newDelta === undefined || newDelta === null) return;

    this.newDelta.emit(newDelta);
  }
}
