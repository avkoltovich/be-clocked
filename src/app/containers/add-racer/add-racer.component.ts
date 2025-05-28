import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {RacersService} from "../../services/racers.service";
import { map } from "rxjs";
import {IRacer} from "../../models/interfaces";

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

  public onAddRacer(racer: IRacer) {
    const currentList = this.racersService.racers$.value.slice();

    if (racer.startNumber && !isNaN(racer.startNumber)) {
      currentList.splice(racer.startNumber - 1, 0, { ...racer, startNumber: undefined });
    } else {
      currentList.push({ ...racer, startNumber: undefined });
    }

    this.racersService.updateRacers(currentList)

    const currentCategoryMap = { ...this.racersService.categoriesMap$.value };
    currentCategoryMap[racer.category].push(racer);

    this.racersService.updateCategoriesMap(currentCategoryMap)

    this.formGroup.reset();
  }
}
