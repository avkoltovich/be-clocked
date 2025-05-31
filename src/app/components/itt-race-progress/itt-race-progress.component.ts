import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RACERS_DELTA} from "../../constants/itt.constants";

@Component({
  selector: 'app-itt-race-progress',
  templateUrl: './itt-race-progress.component.html',
  styleUrls: ['./itt-race-progress.component.scss']
})
export class IttRaceProgressComponent {
  @Input() currentRacer = '';

  @Input() nextRacer = '';

  @Input() showRacerNames = true;

  @Input() showTimer = true;

  @Input() deltaEditMode = true;

  @Input() currentTimerValue: number = RACERS_DELTA;

  @Input() maxTimerValue: number = RACERS_DELTA;

  @Input() showEmptyRacerListNotification = true;

  @Output() delta = new EventEmitter();

  public onDeltaClick() {
    this.delta.emit();
  }
}
