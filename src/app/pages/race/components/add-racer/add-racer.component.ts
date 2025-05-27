import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RacersService } from "../../services/racers.service";
import { map } from "rxjs";

@Component({
  selector: "app-add-racer",
  templateUrl: "./add-racer.component.html",
  styleUrls: ["./add-racer.component.scss"]
})
export class AddRacerComponent {
  public formGroup = new FormGroup({
    racer: new FormControl("", Validators.required),
    number: new FormControl("", Validators.required),
    startNumber: new FormControl(""),
    category: new FormControl("", Validators.required)
  });

  public categories$ = this.racersService.categoriesMap$.pipe(
    map((categoriesMap) => Object.keys(categoriesMap))
  );

  constructor(private racersService: RacersService) {
  }

  public onAddRacer() {
    const name = this.formGroup.controls.racer.value;
    const number = this.formGroup.controls.number.value;
    const racerStartNumber = Number(this.formGroup.controls.startNumber.value);
    const category = this.formGroup.controls.category.value;

    if (name === null || name === "") return;

    const currentList = this.racersService.racers$.value.slice();

    const currentRacer = { name, category: category ?? '', number: Number(number) }

    if (!isNaN(racerStartNumber)) {
      currentList.splice(racerStartNumber - 1, 0, currentRacer);
    } else {
      currentList.push(currentRacer);
    }

    this.racersService.racers$.next(currentList);

    const currentCategoryMap = this.racersService.categoriesMap$.value;
    currentCategoryMap[category!].push(currentRacer);

    this.formGroup.reset();
  }
}
