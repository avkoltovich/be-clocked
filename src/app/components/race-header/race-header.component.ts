import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-race-header',
  templateUrl: './race-header.component.html',
  styleUrls: ['./race-header.component.scss']
})
export class RaceHeaderComponent {
  public isRaceNameEditing = false;

  public raceNameFormControl = new FormControl('', Validators.required);

  @Input() raceName$ = new BehaviorSubject('');

  @Output() raceNameSave = new EventEmitter();

  public onRaceNameClick(): void {
    this.raceNameFormControl.patchValue(this.raceName$.value)
    this.isRaceNameEditing = true
  }

  public onRaceNameSave() {
    const raceName = this.raceNameFormControl.value;

    if (raceName) {
      this.raceNameFormControl.reset();
      this.isRaceNameEditing = false
      this.raceNameSave.emit(raceName);
    }
  }

}
