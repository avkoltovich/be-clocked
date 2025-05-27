import { Component } from "@angular/core";
import {IRacer, RacersService} from "../../services/racers.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {map} from "rxjs";

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

  constructor(private racersService: RacersService) {
  }

  public editedRacer: null | Record<string, any> = null;

  public categories$ = this.racersService.categoriesMap$.pipe(
    map((categoriesMap) => Object.keys(categoriesMap))
  );

  /**
   * TODO: Переписать метод таким образом, чтобы вызывалось редактирование имени
   * Также надо переписать хранение данных. Сейчас список отдельно хранится, а мапа с категориями отдельно.
   * Нужно в список участников добавить всю требуемую инфу. Номер участника, стартовая позиция, категория и прочее
   */
  public edit(i: number, racer: IRacer) {
    const currentList = this.racersService.racers$.value.slice();
    this.formGroup.patchValue({...racer, number: racer.number.toString()});

    this.editedRacer = {
      index: i,
      racer
    };
  }

  public remove(i: number) {
    const currentList = this.racersService.racers$.value.slice();
    currentList.splice(i, 1);
    this.racersService.racers$.next(currentList);
  }

  public up(i: number) {
    const currentList = this.racersService.racers$.value.slice();
    let swap = currentList[i];
    currentList[i] = currentList[i - 1];
    currentList[i - 1] = swap;
    this.racersService.racers$.next(currentList);
  }

  public down(i: number) {
    const currentList = this.racersService.racers$.value.slice();
    let swap = currentList[i];
    currentList[i] = currentList[i + 1];
    currentList[i + 1] = swap;
    this.racersService.racers$.next(currentList);
  }
}
