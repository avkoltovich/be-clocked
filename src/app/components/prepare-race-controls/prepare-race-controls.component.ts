import {AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {catchError, EMPTY, fromEvent, switchMap, tap} from "rxjs";

@Component({
  selector: 'app-prepare-race-controls',
  templateUrl: './prepare-race-controls.component.html',
  styleUrls: ['./prepare-race-controls.component.scss']
})
export class PrepareRaceControlsComponent implements AfterViewInit {
  @ViewChild("fileInput") fileInput: ElementRef<HTMLInputElement> | undefined;

  @Output() googleTable = new EventEmitter();

  @Output() readJSON = new EventEmitter();

  public ngAfterViewInit(): void {
    /**
     *  Хэндлер на загрузку состояния из JSON
     */
    if (this.fileInput !== undefined) {
      fromEvent(this.fileInput.nativeElement, 'change').pipe(
        switchMap(event => {
          const file = (event.target as HTMLInputElement).files![0];
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
        }),
        tap((jsonString) => {
          this.readJSON.emit(JSON.parse(jsonString));
        }),
        catchError((error: Error) => {
          console.warn(error)

          return EMPTY;
        })
      ).subscribe();
    }
  }

  public onGoogleTableClick() {
    this.googleTable.emit();
  }
}
