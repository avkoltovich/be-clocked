import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { RacersService } from "../../services/racers.service";
import { TUI_DEFAULT_MATCHER, tuiControlValue } from "@taiga-ui/cdk";
import { map, takeWhile, tap } from "rxjs";
import { TuiDialogFormService } from "@taiga-ui/kit";
import { TuiDialogService } from "@taiga-ui/core";

export interface IFinisher {
  name: string;
  time: number;
}

export interface IFinishCategory {
  name: string;
  finishers: IFinisher[];
}

@Component({
  selector: "app-finish-race",
  templateUrl: "./finish-race.component.html",
  providers: [TuiDialogFormService],
  styleUrls: ["./finish-race.component.scss"]
})
export class FinishRaceComponent implements OnInit {
  public racerControl = new FormControl("");
  public anonNameControl = new FormControl("");
  public formGroup = new FormGroup({
    racer: this.racerControl
  });
  public finishers: IFinisher[] = [];
  public finishersByCategories: IFinishCategory[] = [];
  public anonFinishers: IFinisher[] = [];
  public anonIndex = 0;
  public currentSelectedAnonIndex: number | null = null;

  public racers$ = tuiControlValue<string>(this.racerControl).pipe(
    map(value => {
      const difference = this.racersService.starterNameList.filter((racer) => {
        return !this.racersService.finisherNameList.includes(racer) && racer !== "Пропуск";
      });
      const filtered = difference.filter(racer => TUI_DEFAULT_MATCHER(racer, value));

      if (
        filtered.length !== 1 ||
        String(filtered[0]).toLowerCase() !== value.toLowerCase()
      ) {
        return filtered;
      }

      return [];
    })
  );

  public anonRacers$ = tuiControlValue<string>(this.anonNameControl).pipe(
    map(value => {
      const difference = this.racersService.starterNameList.filter((racer) => {
        return !this.racersService.finisherNameList.includes(racer) && racer !== "Пропуск";
      });
      const filtered = difference.filter(racer => TUI_DEFAULT_MATCHER(racer, value));

      if (
        filtered.length !== 1 ||
        String(filtered[0]).toLowerCase() !== value.toLowerCase()
      ) {
        return filtered;
      }

      return [];
    })
  );

  public categoriesMap$ = this.racersService.categoriesMap$.pipe(
    tap((categoriesMap) => {
      const categories = Object.keys(categoriesMap);

      if (categories.length > 0) {
        categories.forEach((category) => {
          this.finishersByCategories.push({
            name: category,
            finishers: []
          });
        });
      }
    }),
    takeWhile((categoriesMap) => Object.keys(categoriesMap).length === 0)
  );

  constructor(private racersService: RacersService,
              @Inject(TuiDialogFormService) private readonly dialogForm: TuiDialogFormService,
              @Inject(TuiDialogService) private readonly dialogs: TuiDialogService) {
  }

  public ngOnInit() {
    const finishersFromLS = this.racersService.readFinishersFromLS();
    const anonFinishersFromLS = this.racersService.readAnonsFromLS();
    const anonIndexFromLS = this.racersService.readCurrentAnonIndexFromLS();
    const finishersByCategories = this.racersService.readFinishersByCategoriesFromLS();

    if (finishersFromLS !== null) {
      this.finishers = finishersFromLS;
    }

    if (anonFinishersFromLS !== null) {
      this.anonFinishers = anonFinishersFromLS;
    }

    if (anonIndexFromLS !== null) {
      this.anonIndex = anonIndexFromLS;
    }

    if (finishersByCategories !== null) {
      this.finishersByCategories = finishersByCategories;
    } else {
      this.categoriesMap$.subscribe();
    }
  }

  public onFinish(currentTime = Date.now(), currentRacerName = this.formGroup.controls.racer.value) {
    this.racerControl.setValue("");

    if (currentRacerName !== null && currentRacerName !== "") {
      this.racersService.finisherNameList.push(currentRacerName);
      this.racersService.updateFinisherNameListInLS(this.racersService.finisherNameList);

      const finishers = this.finishers.slice();
      const startedData = this.racersService.startedRacers.find((starter) => starter.name === currentRacerName);

      if (startedData === undefined) return;

      const actualTime = currentTime - startedData!.time;

      finishers.push({
        name: currentRacerName,
        time: actualTime
      });

      finishers.sort((a, b) => a.time - b.time);

      this.finishers = finishers.slice();
      this.racersService.updateFinishersDataInLS(this.finishers);

      let categoryName = "";

      /**
       * TODO: Починить
       */
      // for (const category in this.racersService.categoriesMap$.value) {
      //   if (this.racersService.categoriesMap$.value[category].includes(currentRacerName)) {
      //     categoryName = category;
      //     break;
      //   }
      // }

      const categoryIndex = this.finishersByCategories.findIndex((finishCategory) => finishCategory.name === categoryName);
      this.finishersByCategories[categoryIndex].finishers.push({
        name: currentRacerName,
        time: actualTime
      });

      this.finishersByCategories[categoryIndex].finishers.sort((a, b) => a.time - b.time);
      this.racersService.updateFinishersByCategoriesInLS(this.finishersByCategories);
    }
  }

  public getTimeRemaining(t: number) {
    const mseconds = Math.floor(t % 1000);
    const seconds = Math.floor((t / 1000) % 60);
    const minutes = Math.floor((t / 1000 / 60) % 60);
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${mseconds.toString().padStart(3, "0")}`;
  };

  public onAnonButton() {
    this.anonIndex++;
    const time = Date.now();
    const name = `Аноним ${this.anonIndex}`;

    this.anonFinishers.push({
      name,
      time
    });

    this.racersService.updateAnonsInLS(this.anonFinishers);
    this.racersService.updateCurrentAnonIndexInLS(this.anonIndex);
  }

  public onAnonInList(content: any, i: number): void {
    this.currentSelectedAnonIndex = i;

    this.dialogs.open(content).subscribe({
      complete: () => {
        this.anonNameControl.setValue("");
        this.dialogForm.markAsPristine();
      }
    });
  }

  public onRenameAnon() {
    if (this.currentSelectedAnonIndex === null) return;

    const currentNameForAnon = this.anonNameControl.value;
    const currentSelectedAnon = this.anonFinishers[this.currentSelectedAnonIndex];

    if (currentNameForAnon === null || currentNameForAnon === "") return;

    this.onFinish(currentSelectedAnon.time, currentNameForAnon);

    this.anonFinishers.splice(this.currentSelectedAnonIndex, 1);
    this.currentSelectedAnonIndex = null;
    this.racersService.updateAnonsInLS(this.anonFinishers);
  }

  public removeAnon(i: number) {
    this.anonFinishers.splice(i, 1);
    this.racersService.updateAnonsInLS(this.anonFinishers);
  }
}
