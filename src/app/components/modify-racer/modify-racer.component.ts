import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {EMPTY, Observable, of} from "rxjs";
import {IRacer} from "../../pages/race/services/racers.service";

@Component({
  selector: 'app-modify-racer',
  templateUrl: './modify-racer.component.html',
  styleUrls: ['./modify-racer.component.scss']
})
export class ModifyRacerComponent {
  public formGroup = new FormGroup({
    racer: new FormControl("", Validators.required),
    number: new FormControl("", Validators.required),
    startNumber: new FormControl(""),
    category: new FormControl("", Validators.required)
  });

  @Input() categories$: Observable<string[]> = EMPTY;
  @Output() addRacer: EventEmitter<IRacer> = new EventEmitter();

  public onAddRacer() {
    const name = this.formGroup.controls.racer.value;
    const number = this.formGroup.controls.number.value;
    const startNumber = Number(this.formGroup.controls.startNumber.value);
    const category = this.formGroup.controls.category.value;

    if (name === null || name === "") return;

    this.addRacer.emit({ name, startNumber, category: category ?? '', number: Number(number) });
  }
}
