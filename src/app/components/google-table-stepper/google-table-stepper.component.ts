import {Component, EventEmitter, Inject, Output} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {finalize, tap} from "rxjs";
import {GoogleTableService} from "../../services/google-table.service";
import {TuiAlertService, TuiNotification} from "@taiga-ui/core";

export interface IGoogleTableData {
  tableKeys: Record<string, string>;
  tableData: Record<string, string>[];
}

@Component({
  selector: 'app-google-table-stepper',
  templateUrl: './google-table-stepper.component.html',
  styleUrls: ['./google-table-stepper.component.scss']
})
export class GoogleTableStepperComponent {
  public currentStepperIndex = 0;
  public googleTableSheetUrlControl = new FormControl("", Validators.required);
  public googleTableSheetData: Record<string, string>[] = []
  public googleTableSheetKeys: string[] = [];
  public googleTableSheetKeyMap: Record<string, string> = {}
  public isGoogleTableSheetLoading: boolean = false;

  @Output() cancel = new EventEmitter();

  @Output() complete: EventEmitter<IGoogleTableData> = new EventEmitter();

  constructor(private googleTableService: GoogleTableService,
              @Inject(TuiAlertService) private readonly alerts: TuiAlertService) {
  }

  public onCancel() {
    this.cancel.emit();
  }

  public onComplete() {
    this.complete.emit({
      tableKeys: this.googleTableSheetKeyMap,
      tableData: this.googleTableSheetData
    });
  }

  public nextStep(): void {
    this.currentStepperIndex = this.currentStepperIndex + 1;
  }

  public onGetGoogleTableData() {
    this.googleTableSheetUrlControl.disable()
    this.isGoogleTableSheetLoading = true;

    const url = this.googleTableSheetUrlControl.value;

    if (typeof url === "string" && url.startsWith('http')) {
      const id = this.googleTableService.extractGoogleSheetId(url);

      if (id !== null) {
        this.googleTableService.getSheetData(id).pipe(
          tap((data) => {
            if (data && data.length > 0) {
              this.googleTableSheetData = data;
              this.googleTableSheetKeys = Object.keys(data[0]);
            }
          }),
          finalize(() => {
            this.nextStep();
            this.isGoogleTableSheetLoading = false;
            this.googleTableSheetUrlControl.enable();
            this.googleTableSheetUrlControl.reset();
          })
        ).subscribe();

        return;
      }
    }

    this.showGoogleTableAlert();
    this.isGoogleTableSheetLoading = false;
    this.googleTableSheetUrlControl.enable();
  }

  public onGoogleCellClick(index: number, cellName: string) {
    this.googleTableSheetKeyMap[cellName] = this.googleTableSheetKeys[index];
    this.googleTableSheetKeys.splice(index, 1);
  }

  public showGoogleTableAlert(): void {
    this.alerts
      .open(
        'Не удалось получить данные из <strong>Google Таблицы</strong>.<br> Проверьте <strong>URL</strong>',
        { label: 'Ошибка!', status: TuiNotification.Error, autoClose: false })
      .subscribe();
  }
}
