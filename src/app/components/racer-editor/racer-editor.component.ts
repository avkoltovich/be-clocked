import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {EMPTY, Observable} from "rxjs";
import {ModifyMode} from "../../models/enums";
import {IRacer} from "../../models/interfaces";

@Component({
  selector: 'app-racer-editor',
  templateUrl: './racer-editor.component.html',
  styleUrls: ['./racer-editor.component.scss']
})
export class RacerEditorComponent implements OnChanges {
  public formGroup = new FormGroup({
    name: new FormControl("", Validators.required),
    number: new FormControl("", Validators.required),
    startNumber: new FormControl(""),
    category: new FormControl("", Validators.required)
  });

  public isAddCategoryMode = false;

  @Input() categories$: Observable<string[]> = EMPTY;

  @Input() mode: ModifyMode = ModifyMode.CREATE;

  @Input() formValue? = {}

  @Output() changeRacer: EventEmitter<IRacer> = new EventEmitter();

  @Output() cancel = new EventEmitter();

  public buttonLabelMap = {
    [ModifyMode.CREATE]: 'Добавить',
    [ModifyMode.EDIT]: 'Сохранить',
  }

  protected readonly ModifyMode = ModifyMode;

  public onChangeRacer() {
    const name = this.formGroup.controls.name.value;
    const number = this.formGroup.controls.number.value;
    const startNumber = Number(this.formGroup.controls.startNumber.value);
    const category = this.formGroup.controls.category.value;

    if (name === null || name === "") return;

    this.changeRacer.emit({ name, startNumber, category: category ?? '', number: Number(number) });
    this.isAddCategoryMode = false;
    this.formGroup.reset();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['formValue'] !== undefined) {
      this.formGroup.patchValue(changes['formValue'].currentValue)
    }
  }

  protected readonly oncancel = oncancel;

  public onCancel() {
    this.cancel.emit();
  }
}
