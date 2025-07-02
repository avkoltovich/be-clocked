import {Component, Input} from '@angular/core';
import {RacerStatus} from "../../models/enums";

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  protected readonly RacerStatus = RacerStatus;

  @Input() status: RacerStatus = RacerStatus.READY;
}
