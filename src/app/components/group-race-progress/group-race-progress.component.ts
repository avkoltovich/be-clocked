import {Component, Input} from '@angular/core';
import {Observable, timer} from "rxjs";
import {RaceStatus} from "../../models/enums";

@Component({
  selector: 'app-group-race-progress',
  templateUrl: './group-race-progress.component.html',
  styleUrls: ['./group-race-progress.component.scss']
})
export class GroupRaceProgressComponent {
  public isCycleCountSet = false;

  @Input() groupRaceTimer$: Observable<number> = timer(0, 1000);
  protected readonly RaceStatus = RaceStatus;

  public onCycleCountClick() {
    this.isCycleCountSet = true;
  }
}
