import {Component, Inject, OnInit} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {RacersService} from "../../services/racers.service";
import {TUI_DEFAULT_MATCHER, tuiControlValue} from "@taiga-ui/cdk";
import {map, takeWhile, tap} from "rxjs";
import {TuiDialogFormService} from "@taiga-ui/kit";
import {TuiDialogService} from "@taiga-ui/core";
import {RepositoryService} from "../../services/repository.service";
import {IFinishCategory, IFinisher, IRacer} from "../../models/interfaces";

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
  public isRaceStarted$ = this.racersService.isRaceStarted$;

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
              @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
              private repositoryService: RepositoryService) {
  }

  public ngOnInit() {
    const finishers = this.repositoryService.readFinishers();
    const anonFinishers = this.repositoryService.readAnons();
    const anonIndex = this.repositoryService.readCurrentAnonIndex();
    const finishersByCategories = this.repositoryService.readFinishersByCategories();

    if (finishers !== null) {
      this.finishers = finishers;
    }

    if (anonFinishers !== null) {
      this.anonFinishers = anonFinishers;
    }

    if (anonIndex !== null) {
      this.anonIndex = anonIndex;
    }

    if (finishersByCategories !== null) {
      this.finishersByCategories = finishersByCategories;
    } else {
      this.categoriesMap$.subscribe();
    }
  }

  public onFinish(currentTime = Date.now(), currentRacerNameAndNumber = this.formGroup.controls.racer.value) {
    this.racerControl.setValue("");

    if (currentRacerNameAndNumber !== null && currentRacerNameAndNumber !== "") {
      this.racersService.finisherNameList.push(currentRacerNameAndNumber);
      this.repositoryService.updateFinisherNameList(this.racersService.finisherNameList);
      const currentRacer = this.racersService.splitRacerNameAndNumberString(currentRacerNameAndNumber);

      const finishers = this.finishers.slice();
      const startedData = this.racersService.startedRacers.find((starter) => starter.racer.number === currentRacer.number);

      if (startedData === undefined) return;

      const actualTime = currentTime - startedData!.time;

      finishers.push({
        name: currentRacerNameAndNumber,
        time: actualTime
      });

      finishers.sort((a, b) => a.time - b.time);

      this.finishers = finishers.slice();
      this.repositoryService.updateFinishers(this.finishers);

      let categoryName = "";

      for (const category in this.racersService.categoriesMap$.value) {
        if (this.racersService.categoriesMap$.value[category].filter((racer) => racer.number === currentRacer.number).length > 0) {
          categoryName = category;
          break;
        }
      }

      const categoryIndex = this.finishersByCategories.findIndex((finishCategory) => finishCategory.name === categoryName);
      this.finishersByCategories[categoryIndex].finishers.push({
        name: currentRacerNameAndNumber,
        time: actualTime
      });

      this.finishersByCategories[categoryIndex].finishers.sort((a, b) => a.time - b.time);
      this.repositoryService.updateFinishersByCategories(this.finishersByCategories);
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

    this.repositoryService.updateAnons(this.anonFinishers);
    this.repositoryService.updateCurrentAnonIndex(this.anonIndex);
  }

  public openAnonSelectDialog(content: any, i: number): void {
    this.currentSelectedAnonIndex = i;

    this.dialogs.open(content, { size: 's' }).subscribe({
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
    this.repositoryService.updateAnons(this.anonFinishers);
  }

  public removeAnon(i: number) {
    this.anonFinishers.splice(i, 1);
    this.repositoryService.updateAnons(this.anonFinishers);
  }

  public openRemoveDialog(content: any): void {
    this.dialogs.open(content, { size: 's' }).subscribe();
  }
}
