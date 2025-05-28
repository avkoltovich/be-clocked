import { Component } from "@angular/core";
import {RacersService} from "../../services/racers.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {map} from "rxjs";
import {ModifyMode} from "../../models/enums";
import {IRacer} from "../../models/interfaces";

interface ICurrentRacer {
  index: number;
  racer: IRacer;
}

@Component({
  selector: "app-racer-list",
  templateUrl: "./racer-list.component.html",
  styleUrls: ["./racer-list.component.scss"]
})
export class RacerListComponent {
  public currentRacerIndex$ = this.racersService.currentRacerIndex$;
  public isRaceStarted$ = this.racersService.isRaceStarted$;
  public racers$ = this.racersService.racers$;

  public formGroup = new FormGroup({
    racer: new FormControl("", Validators.required),
    number: new FormControl("", Validators.required),
    category: new FormControl("", Validators.required)
  });

  public formValue = {};

  protected readonly ModifyMode = ModifyMode;

  public currentRacer: null | ICurrentRacer = null;

  public categories$ = this.racersService.categoriesMap$.pipe(
    map((categoriesMap) => Object.keys(categoriesMap))
  );

  constructor(private racersService: RacersService) {
  }

  private cleanCategoriesMap(racer = this.currentRacer?.racer) {
    if (racer) {
      const currenCategory = this.racersService.categoriesMap$.value[racer.category].filter((item) => {
        return item.number !== racer.number;
      });

      this.racersService.updateCategoriesMap({
        ...this.racersService.categoriesMap$.value,
        [racer.category]: currenCategory
      });
    }
  }

  public onCancel() {
    this.currentRacer = null;
  }

  public onSave(racer: IRacer) {
    if (this.currentRacer === null) return;

    if (this.currentRacer.racer.category !== racer.category) {
      this.cleanCategoriesMap();
      const currentCategoriesMap = this.racersService.categoriesMap$.value;
      currentCategoriesMap[this.currentRacer.racer.category].push(racer);

      this.racersService.updateCategoriesMap(currentCategoriesMap);
    }

    const currentList = this.racersService.racers$.value.slice();
    currentList[this.currentRacer.index] = racer;

    this.racersService.updateRacers(currentList);
    this.currentRacer = null;
  }

  public edit(i: number, racer: IRacer) {
    this.formValue = {...racer, number: racer.number.toString()};

    this.currentRacer = {
      index: i,
      racer
    };
  }

  public remove(i: number, racer: IRacer) {
    const currentList = this.racersService.racers$.value.slice();
    currentList.splice(i, 1);
    this.racersService.racers$.next(currentList);
    this.racersService.updateRacers(currentList);
    this.cleanCategoriesMap(racer);
  }

  public up(i: number) {
    const currentList = this.racersService.racers$.value.slice();
    let swap = currentList[i];
    currentList[i] = currentList[i - 1];
    currentList[i - 1] = swap;
    this.racersService.updateRacers(currentList);
  }

  public down(i: number) {
    const currentList = this.racersService.racers$.value.slice();
    let swap = currentList[i];
    currentList[i] = currentList[i + 1];
    currentList[i + 1] = swap;
    this.racersService.updateRacers(currentList);
  }

  public generateRacerNameAndNumberString(racer: IRacer) {
    return this.racersService.generateRacerNameAndNumberString(racer);
  }
}
