import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {BehaviorSubject, takeUntil, tap} from "rxjs";
import {RaceType} from "../../models/enums";
import {TuiDestroyService} from "@taiga-ui/cdk";

@Component({
  selector: 'app-race-header',
  templateUrl: './race-header.component.html',
  styleUrls: ['./race-header.component.scss']
})
export class RaceHeaderComponent implements OnInit {
  protected readonly RaceType = RaceType;

  public isRaceNameEditing = false;

  public raceNameFormControl = new FormControl('', Validators.required);

  public raceType = new FormControl(RaceType.ITT);

  @Input() raceName$ = new BehaviorSubject('');

  @Input() raceType$ = new BehaviorSubject(RaceType.ITT);

  @Input() isRaceBeginning$ = new BehaviorSubject(false);

  @Output() raceNameSave: EventEmitter<string> = new EventEmitter();

  @Output() raceTypeChange: EventEmitter<RaceType> = new EventEmitter();

  constructor(@Inject(TuiDestroyService)
              private readonly destroy$: TuiDestroyService) {
  }

  public ngOnInit(): void {
    this.raceType.valueChanges.pipe(
      tap((value) => {
        if (value) {
          this.raceTypeChange.emit(value)
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.isRaceBeginning$.pipe(
      tap((isRaceBeginning) => {
        if (isRaceBeginning) {
          this.raceType.disable();
        } else {
          this.raceType.enable();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe()
  }

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

  public onRaceTypeClick(raceType: RaceType) {
    this.raceTypeChange.emit(raceType);
  }
}
