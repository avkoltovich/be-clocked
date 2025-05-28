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

  constructor(private racersService: RacersService) {
  }

  public currentRacer: null | ICurrentRacer = null;

  public categories$ = this.racersService.categoriesMap$.pipe(
    map((categoriesMap) => Object.keys(categoriesMap))
  );

  public onCancel() {
    this.currentRacer = null;
  }

  public onSave(racer: IRacer) {
    if (this.currentRacer === null) return;

    const currentList = this.racersService.racers$.value.slice();
    currentList[this.currentRacer.index] = racer;

    this.racersService.racers$.next(currentList);
    this.currentRacer = null;
  }

  /**
   * TODO: Переписать метод таким образом, чтобы вызывалось редактирование имени
   * Также надо переписать хранение данных. Сейчас список отдельно хранится, а мапа с категориями отдельно.
   * Нужно в список участников добавить всю требуемую инфу. Номер участника, стартовая позиция, категория и прочее
   */
  public edit(i: number, racer: IRacer) {
    const currentList = this.racersService.racers$.value.slice();
    this.formValue = {...racer, number: racer.number.toString()};

    this.currentRacer = {
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

  protected readonly ModifyMode = ModifyMode;
}
