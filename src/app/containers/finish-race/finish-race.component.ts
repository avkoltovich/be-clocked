import {Component, Inject} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {RacersService} from "../../services/racers.service";
import {TUI_DEFAULT_MATCHER, tuiControlValue} from "@taiga-ui/cdk";
import {map} from "rxjs";
import {TuiDialogFormService} from "@taiga-ui/kit";
import {TuiDialogService} from "@taiga-ui/core";
import {FinishersService} from "../../services/finishers.service";
import {CurrentRaceService} from "../../services/current-race.service";
import {RacerStatus, RaceType} from "../../models/enums";
import {IFinisher, IStarter} from "../../models/interfaces";

@Component({
  selector: "app-finish-race",
  templateUrl: "./finish-race.component.html",
  providers: [TuiDialogFormService],
  styleUrls: ["./finish-race.component.scss"]
})
export class FinishRaceComponent {
  public racerControl = new FormControl("");
  public anonNameControl = new FormControl("");
  public formGroup = new FormGroup({
    racer: this.racerControl
  });
  public finishers$ = this.finishersService.finishers$;
  public finishersByCategoriesMap$ = this.finishersService.finishersByCategoriesMap$;
  public anonFinishers$ = this.finishersService.anonFinishers$;
  public anonIndex$ = this.finishersService.currentAnonIndex$;
  public currentSelectedAnonIndex: number | null = null;
  public isRaceBeginning$ = this.currentRaceService.isRaceBeginning$;
  public isRaceEnded$ = this.currentRaceService.isRaceEnded$;
  public raceType$ = this.currentRaceService.raceType$;
  public lapByCategoriesMap = this.currentRaceService.lapByCategoriesMap;

  public racers$ = tuiControlValue<string>(this.racerControl).pipe(
    map(value => {
      const difference = this.racersService.starterNameList$.value.filter((racer) => {
        return !this.finishersService.finisherNameList.includes(racer);
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
        return !this.finishersService.finisherNameList.includes(racer);
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

  public get isLapRace(): boolean {
    return this.currentRaceService.isLapRace
  }

  public get categories() {
    return Object.keys(this.finishersByCategoriesMap$.value);
  }

  constructor(private racersService: RacersService,
              private finishersService: FinishersService,
              private currentRaceService: CurrentRaceService,
              @Inject(TuiDialogFormService) private readonly dialogForm: TuiDialogFormService,
              @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
  ) {
  }

  public onFinish(currentTime = Date.now(), currentRacerNameAndNumber = this.formGroup.controls.racer.value) {
    if (currentRacerNameAndNumber !== null && currentRacerNameAndNumber !== "") {
      this.racerControl.setValue("");

      const racerNameAndNumber = this.racersService.splitRacerNameAndNumberString(currentRacerNameAndNumber);
      const startedData = this.racersService.startedRacers.find((starter) => starter.racer.number === racerNameAndNumber.number);

      if (startedData === undefined) return;

      /**
       * У гонки на круги своя логика финиша
       */
      if (this.currentRaceService.isLapRace) return this.onLapRaceFinish(currentTime, currentRacerNameAndNumber, racerNameAndNumber, startedData);

      const currentRacerIndex = this.racersService.racers$.value.findIndex((racer) => racer.number === racerNameAndNumber.number);
      const currentRacer = this.racersService.racers$.value[currentRacerIndex];
      const categoryName = currentRacer.category;
      const actualTime = currentTime - startedData!.time;
      const currentFinisher = {
        name: currentRacerNameAndNumber,
        time: actualTime
      }


      this.finishersService.updateFinisherNameList([ ...this.finishersService.finisherNameList, currentRacerNameAndNumber ]);
      this.updateFinisherList(this.finishers$.value.slice(), currentFinisher)
      this.updateFinishersByCategories({ ...this.finishersByCategoriesMap$.value }, categoryName, currentFinisher)
      this.racersService.updateRacerStatusByIndex(currentRacerIndex, RacerStatus.FINISHED)
      this.checkAllFinished()
    } else {
      /**
       * TODO: Добавить обработку ошибок
       */
    }
  }

  public getTimeRemaining(t: number | null) {
    if (t === null) return '';

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

    this.onFinish(currentSelectedAnon.time!, currentNameForAnon);

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

  public getArrayByLength(length: number): number[] {
    return new Array(length).fill(0).map((_, i) => i + 1);
  }

  private checkAllFinished() {
    if (this.racersService.racers$.value.every((racer) => racer.status === RacerStatus.FINISHED)) {
      this.finishersService.isAllFinished$.next(true);
    }
  }

  private onLapRaceFinish(currentTime: number, currentRacerNameAndNumber: string, racerNameAndNumber: { name: string, number: number }, startedData: IStarter) {
    const currentRacerIndex = this.racersService.racers$.value.findIndex((racer) => racer.number === racerNameAndNumber.number);
    const currentRacer = this.racersService.racers$.value[currentRacerIndex];
    const categoryName = currentRacer.category;
    const actualTime = currentTime - startedData!.time;

    const currentFinisher = this.updateCurrentFinisherForLapRace(actualTime, currentRacerNameAndNumber, categoryName);

    this.updateFinishersByCategoriesForLapRace(categoryName, currentFinisher);

    const isFinishLap = currentFinisher.timeList?.length === this.currentRaceService.lapByCategoriesMap[categoryName];

    /**
     * Обновляется только, когда финишный круг
     */
    if (isFinishLap) {
      this.sortFinishersForLapRace();
      this.sortFinishersForLapRace(categoryName);
      this.finishersService.updateFinisherNameList([...this.finishersService.finisherNameList, currentRacerNameAndNumber]);
      this.racersService.updateRacerStatusByIndex(currentRacerIndex, RacerStatus.FINISHED)
      this.checkAllFinished()
    }
  }

  private sortFinishersForLapRace(category: string | null = null) {
    let finishers: IFinisher[] = []

    if (category === null) {
      finishers = this.finishers$.value.slice();
    } else {
      finishers = this.finishersByCategoriesMap$.value[category].slice();
    }

    const finished: IFinisher[] = [];
    const inProgress: IFinisher[] = []

    finishers.forEach((finisher) => {
      if (finisher.time !== null) {
        finished.push(finisher);
      } else {
        inProgress.push(finisher);
      }
    })

    finished.sort((a, b) => a.time! - b.time!);

    const sortedFinishers: IFinisher[] = finished.concat(inProgress);

    if (category === null) {
      this.finishersService.updateFinishers(sortedFinishers);
    } else {
      const finishersByCategoriesMap = { ...this.finishersByCategoriesMap$.value }
      finishersByCategoriesMap[category] = sortedFinishers;

      this.finishersService.updateFinishersByCategories(finishersByCategoriesMap);
    }


  }

  private updateFinishersByCategoriesForLapRace(categoryName: string, currentFinisher: IFinisher) {
    const finishersByCategoriesMap = { ...this.finishersByCategoriesMap$.value }

    if (finishersByCategoriesMap[categoryName] === undefined) {
      finishersByCategoriesMap[categoryName] = [ currentFinisher ];
    } else {
      const currentFinisherIndex = finishersByCategoriesMap[categoryName].findIndex((finisher) => finisher.name === currentFinisher.name);

      if (currentFinisherIndex === -1) {
        finishersByCategoriesMap[categoryName].push(currentFinisher);
      } else {
        finishersByCategoriesMap[categoryName][currentFinisherIndex] = currentFinisher
      }
    }

    this.finishersService.updateFinishersByCategories(finishersByCategoriesMap);
  }

  private updateCurrentFinisherForLapRace(actualTime: number, currentRacerNameAndNumber: string, categoryName: string) {
    const finishers = this.finishers$.value.slice();
    const currentFinisherIndex = finishers.findIndex((finisher) => finisher.name === currentRacerNameAndNumber);
    let currentFinisher;

    if (currentFinisherIndex === -1) {
      const finishTime = this.currentRaceService.lapByCategoriesMap[categoryName] === 1 ? actualTime : null

      currentFinisher = {
        name: currentRacerNameAndNumber,
        time: finishTime,
        timeList: [actualTime]
      }

      finishers.push(currentFinisher);

    } else {
      currentFinisher = finishers[currentFinisherIndex];

      const totalTime = currentFinisher.timeList!.reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0);

      finishers[currentFinisherIndex].timeList?.push(actualTime - totalTime)

      const isFinishLap = currentFinisher.timeList?.length === this.currentRaceService.lapByCategoriesMap[categoryName];

      if (isFinishLap) finishers[currentFinisherIndex].time = actualTime;
    }

    this.finishersService.updateFinishers(finishers);

    return currentFinisher;
  }

  private updateFinisherList(finishers: IFinisher[], currentFinisher: { name: string; time: number }) {
    finishers.push(currentFinisher);
    finishers.sort((a, b) => a.time! - b.time!);

    this.finishersService.updateFinishers(finishers.slice());
  }

  private updateFinishersByCategories(finishersByCategories: Record<string, IFinisher[]>, categoryName: string, currentFinisher: { name: string; time: number }) {
    /**
     * Если категория не пустая, добавляем, в противном случае создаем
     */
    if (finishersByCategories[categoryName] !== undefined) {
      finishersByCategories[categoryName].push(currentFinisher)
    } else {
      finishersByCategories[categoryName] = [currentFinisher]
    }

    finishersByCategories[categoryName].sort((a, b) => a.time! - b.time!);

    this.finishersService.updateFinishersByCategories(finishersByCategories);
  }

  protected readonly RaceType = RaceType;
}
