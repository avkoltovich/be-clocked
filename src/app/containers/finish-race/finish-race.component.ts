import {Component, Inject, OnInit} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {RacersService} from "../../services/racers.service";
import {TUI_DEFAULT_MATCHER, tuiControlValue} from "@taiga-ui/cdk";
import {map, tap} from "rxjs";
import {TuiDialogFormService} from "@taiga-ui/kit";
import {TuiDialogService} from "@taiga-ui/core";
import {FinishersService} from "../../services/finishers.service";
import {SKIPPED_RACER_NAME} from "../../constants/itt.constants";

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
  public finishers$ = this.finishersService.finishers$;
  public finishersByCategories$ = this.finishersService.finishersByCategories$;
  public anonFinishers$ = this.finishersService.anonFinishers$;
  public anonIndex$ = this.finishersService.currentAnonIndex$;
  public currentSelectedAnonIndex: number | null = null;
  public isRaceStarted$ = this.racersService.isRaceStarted$;
  public starterNameList$ = this.racersService.starterNameList$;

  public racers$ = tuiControlValue<string>(this.racerControl).pipe(
    map(value => {
      const difference = this.racersService.starterNameList$.value.filter((racer) => {
        return !this.finishersService.finisherNameList.includes(racer) && racer !== SKIPPED_RACER_NAME;
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
      const difference = this.racersService.starterNameList$.value.filter((racer) => {
        return !this.finishersService.finisherNameList.includes(racer) && racer !== SKIPPED_RACER_NAME;
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
          const finishersByCategory = this.finishersByCategories$.value.slice()

          finishersByCategory.push({
            name: category,
            finishers: []
          });

          this.finishersByCategories$.next(finishersByCategory);
        });
      }
    })
  );

  constructor(private racersService: RacersService,
              @Inject(TuiDialogFormService) private readonly dialogForm: TuiDialogFormService,
              @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
              private finishersService: FinishersService) {
  }

  public ngOnInit() {
    this.categoriesMap$.subscribe();
  }

  public onFinish(currentTime = Date.now(), currentRacerNameAndNumber = this.formGroup.controls.racer.value) {
    this.racerControl.setValue("");

    if (currentRacerNameAndNumber !== null && currentRacerNameAndNumber !== "") {
      const finisherNameList = this.finishersService.finisherNameList.slice();
      finisherNameList.push(currentRacerNameAndNumber);

      this.finishersService.updateFinisherNameList(finisherNameList);
      const currentRacer = this.racersService.splitRacerNameAndNumberString(currentRacerNameAndNumber);

      const finishers = this.finishers$.value.slice();
      const startedData = this.racersService.startedRacers.find((starter) => starter.racer.number === currentRacer.number);

      if (startedData === undefined) return;

      const actualTime = currentTime - startedData!.time;

      finishers.push({
        name: currentRacerNameAndNumber,
        time: actualTime
      });

      finishers.sort((a, b) => a.time - b.time);

      this.finishersService.updateFinishers(finishers.slice());

      let categoryName = "";

      for (const category in this.racersService.categoriesMap$.value) {
        if (this.racersService.categoriesMap$.value[category].filter((racer) => racer.number === currentRacer.number).length > 0) {
          categoryName = category;
          break;
        }
      }

      const finishersByCategories = this.finishersByCategories$.value.slice();

      const categoryIndex = finishersByCategories.findIndex((finishCategory) => finishCategory.name === categoryName);

      finishersByCategories[categoryIndex].finishers.push({
        name: currentRacerNameAndNumber,
        time: actualTime
      });

      finishersByCategories[categoryIndex].finishers.sort((a, b) => a.time - b.time);

      this.finishersService.updateFinishersByCategories(finishersByCategories);
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
    const anonIndex = this.anonIndex$.value + 1;
    const time = Date.now();
    const name = `Аноним ${anonIndex}`;

    const anonFinishers = this.anonFinishers$.value.slice();

    anonFinishers.push({
      name,
      time
    });

    this.finishersService.updateAnonData(anonFinishers, anonIndex);
  }

  public openAnonSelectDialog(content: any, i: number): void {
    this.currentSelectedAnonIndex = i;

    this.dialogs.open(content, {size: 's'}).subscribe({
      complete: () => {
        this.anonNameControl.setValue("");
        this.dialogForm.markAsPristine();
      }
    });
  }

  public onRenameAnon() {
    if (this.currentSelectedAnonIndex === null) return;

    const anonFinishers = this.anonFinishers$.value.slice();
    const currentNameForAnon = this.anonNameControl.value;
    const currentSelectedAnon = anonFinishers[this.currentSelectedAnonIndex];

    if (currentNameForAnon === null || currentNameForAnon === "") return;

    this.onFinish(currentSelectedAnon.time, currentNameForAnon);

    anonFinishers.splice(this.currentSelectedAnonIndex, 1);
    this.currentSelectedAnonIndex = null;

    this.finishersService.updateAnonData(anonFinishers);
  }

  public removeAnon(i: number) {
    const anonFinishers = this.anonFinishers$.value.slice();

    anonFinishers.splice(i, 1);
    this.finishersService.updateAnonData(anonFinishers);
  }

  public openRemoveDialog(content: any): void {
    this.dialogs.open(content, {size: 's'}).subscribe();
  }
}
