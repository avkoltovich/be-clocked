import {Component, Input} from '@angular/core';
import {Observable, timer} from "rxjs";

@Component({
  selector: 'app-group-race-progress',
  templateUrl: './group-race-progress.component.html',
  styleUrls: ['./group-race-progress.component.scss']
})
export class GroupRaceProgressComponent {
  @Input() groupRaceTimer$: Observable<number> = timer(0, 1000);

  @Input() isRacersListEmpty = true;
}
