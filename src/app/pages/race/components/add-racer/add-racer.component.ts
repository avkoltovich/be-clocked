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
    const racerName = this.formGroup.controls.racer.value;
    const racerNumber = this.formGroup.controls.number.value;
    const racerStartNumber = Number(this.formGroup.controls.startNumber.value);
    const racerCategory = this.formGroup.controls.category.value;

    if (racerName === null || racerName === "") return;

    const currentList = this.racersService.racers$.value.slice();

    if (!isNaN(racerStartNumber)) {
      currentList.splice(racerStartNumber - 1, 0, `${racerName} - ${racerNumber ?? ""}`);
    } else {
      currentList.push(`${racerName} - ${racerNumber ?? ""}`);
    }

    this.racersService.racers$.next(currentList);

    const currentCategoryMap = this.racersService.categoriesMap$.value;
    currentCategoryMap[racerCategory!].push(`${racerName} - ${racerNumber ?? ""}`);

    this.formGroup.reset();
  }
}
