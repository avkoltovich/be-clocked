import {Component, Inject, OnInit} from '@angular/core';
import {RacersService} from "../../services/racers.service";
import {takeUntil, tap} from "rxjs";
import {TuiDestroyService} from "@taiga-ui/cdk";
import {FormControl, FormGroup} from "@angular/forms";
import {TuiDialogService} from "@taiga-ui/core";
import {CurrentRaceService} from "../../services/current-race.service";

@Component({
  selector: 'app-lap-race',
  templateUrl: './lap-race.component.html',
  styleUrls: ['./lap-race.component.scss'],
  providers: [TuiDestroyService],
})
export class LapRaceComponent implements OnInit {
  public lapFormGroup: FormGroup = new FormGroup({})
  public categoryList: string[] = []

  public lapByCategoriesMap: Record<string, number> = {}

  constructor(private racersService: RacersService,
              private currentRaceService: CurrentRaceService,
              @Inject(TuiDestroyService) private readonly destroy$: TuiDestroyService,
              @Inject(TuiDialogService) private readonly dialogs: TuiDialogService) {
  }

  ngOnInit(): void {
    this.initLaps();

    this.racersService.categoriesMap$.pipe(
      takeUntil(this.destroy$),
      tap(categories => {
        const categoryList = Object.keys(categories)

        if (this.categoryList.length === 0) {
          this.categoryList = categoryList

          this.categoryList.forEach(category => {
            this.addNewCategory(category)
          })
        } else {
          const newCategories = categoryList.filter(category => !this.categoryList.includes(category))
          this.categoryList = categoryList

          newCategories.forEach(category => {
            this.addNewCategory(category)
          })
        }
      }),
    ).subscribe()
  }

  public openEditDialog(content: any): void {
    this.dialogs.open(content, { size: 'auto' }).subscribe();
  }

  public onSetLaps() {
    const controlNames = Object.keys(this.lapFormGroup.controls)

    controlNames.forEach(controlName => {
      const value = this.lapFormGroup.controls[controlName].value
      this.currentRaceService.updateLapByCategoriesMap(controlName, Number(value))
      this.lapByCategoriesMap[controlName] = Number(value)
    })
  }

  private initLaps(): void {
    this.categoryList = Object.keys(this.currentRaceService.lapByCategoriesMap);
    this.lapByCategoriesMap = this.currentRaceService.lapByCategoriesMap;

    /**
     * Случай, когда мы что-то восстановили из Storage
     */
    if (this.categoryList.length > 0) {
      this.categoryList.forEach(category => {
        this.lapFormGroup.addControl(category, new FormControl(this.lapByCategoriesMap[category]))
      })
    }
  }

  private addNewCategory(categoryName: string): void {
    this.currentRaceService.updateLapByCategoriesMap(categoryName, 1)
    this.lapByCategoriesMap[categoryName] = 1
    this.lapFormGroup.addControl(categoryName, new FormControl(this.lapByCategoriesMap[categoryName]))
  }
}
