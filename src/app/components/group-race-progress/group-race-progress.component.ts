import {Component, Input} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-group-race-progress',
  templateUrl: './group-race-progress.component.html',
  styleUrls: ['./group-race-progress.component.scss']
})
export class GroupRaceProgressComponent {
  @Input() currentTime$: BehaviorSubject<string> = new BehaviorSubject<string>('0:00:00');

  @Input() isRacersListEmpty = true;
}
