import {Component, Inject} from "@angular/core";
import {RacersService} from "../../services/racers.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {map} from "rxjs";
import {ModifyMode} from "../../models/enums";
import {IRacer} from "../../models/interfaces";
import {TuiDialogService} from "@taiga-ui/core";
import {FinishersService} from "../../services/finishers.service";

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
  public isAllMembersHasNumbers$ = this.racersService.isAllMembersHasNumbers$;

  public formGroup = new FormGroup({
    racer: new FormControl("", Validators.required),
    number: new FormControl("", Validators.required),
    category: new FormControl("", Validators.required)
  });

  public numberControl = new FormControl(null, Validators.required);

  public formValue = {};

  protected readonly ModifyMode = ModifyMode;

  public currentRacer: null | ICurrentRacer = null;

  public isEditMode = false;

  public categories$ = this.racersService.categoriesMap$.pipe(
    map((categoriesMap) => Object.keys(categoriesMap))
  );

  constructor(
    private racersService: RacersService,
    private finishersService: FinishersService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
  ) {
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
    this.isEditMode = false;
  }

  public onSave(racer: IRacer) {
    if (this.currentRacer === null) return;

    this.cleanCategoriesMap();
    const currentCategoriesMap = this.racersService.categoriesMap$.value;
    currentCategoriesMap[this.currentRacer.racer.category].push({...racer, startNumber: undefined});

    this.racersService.updateCategoriesMap(currentCategoriesMap);

    const currentList = this.racersService.racers$.value.slice();
    currentList[this.currentRacer.index] = {...racer, startNumber: undefined};

    this.racersService.updateRacers(currentList);
    this.currentRacer = null;
    this.isEditMode = false;
  }

  public edit(index: number, racer: IRacer) {
    this.formValue = {...racer, number: racer.number?.toString()};

    this.currentRacer = {
      index,
      racer
    };

    this.isEditMode = true;
  }

  public remove(i = this.currentRacer?.index, racer = this.currentRacer?.racer) {
    if (i === undefined || racer === undefined) return;

    const currentList = this.racersService.racers$.value.slice();
    currentList.splice(i, 1);
    this.racersService.racers$.next(currentList);
    this.racersService.updateRacers(currentList);
    this.cleanCategoriesMap(racer);
  }

  public openRemoveDialog(content: any, index: number, racer: IRacer): void {
    this.currentRacer = {
      index,
      racer
    };

    this.dialogs.open(content, { size: 'auto' }).subscribe();
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

  public openSetNumberDialog(content: any, index: number, racer: IRacer) {
    this.currentRacer = {
      index,
      racer
    };

    this.dialogs.open(content, { size: 'auto' }).subscribe();
  }

  public onSetNumber() {
    if (this.currentRacer === null) return;

    const racer = { ...this.currentRacer.racer, number: Number(this.numberControl.value) };
    this.numberControl.reset()

    this.onSave(racer)
  }

  public checkRacerStarted(racer: IRacer) {
    return this.racersService.starterNameList$.value.includes(this.generateRacerNameAndNumberString(racer));
  }

  public checkRacerFinished(racer: IRacer) {
    return this.finishersService.finisherNameList.includes(this.generateRacerNameAndNumberString(racer));
  }
}
