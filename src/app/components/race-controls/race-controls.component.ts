import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {RepositoryService} from "../../services/repository.service";
import {catchError, EMPTY, fromEvent, switchMap, tap} from "rxjs";
import {RaceStatus, RaceType} from "../../models/enums";

@Component({
  selector: 'app-race-controls',
  templateUrl: './race-controls.component.html',
  styleUrls: ['./race-controls.component.scss']
})
export class RaceControlsComponent implements AfterViewInit {
  protected readonly RaceStatus = RaceStatus;

  protected readonly RaceType = RaceType;

  public downloadJsonHref: string = '';

  @Input() isRaceBeginning = false;

  @Input() isRaceEnded = false;

  @Input() isRacePaused = false;

  @Input() isAllRacersStarted = false;

  @Input() isAllRacersHasNumbers = false;

  @Input() raceStatus = RaceStatus.PREPARE;

  @Input() raceType: RaceType = RaceType.ITT;

  @Input() isSkipped = false;

  @Output() start = new EventEmitter();

  @Output() stop = new EventEmitter();

  @Output() skip = new EventEmitter();

  @Output() undoSkip = new EventEmitter();

  @Output() pause = new EventEmitter();

  @Output() resetRace = new EventEmitter();

  @Output() googleTable = new EventEmitter();

  @Output() readJSON = new EventEmitter();

  @ViewChild("download") downloadLink: ElementRef<HTMLAnchorElement> | undefined;

  @ViewChild("fileInput") fileInput: ElementRef<HTMLInputElement> | undefined;

  @ViewChild("fileInputForm") fileInputForm: ElementRef<HTMLFormElement> | undefined;

  constructor(private repositoryService: RepositoryService ) {}

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
          this.fileInputForm?.nativeElement.reset();
        }),
        catchError((error: Error) => {
          console.warn(error)

          return EMPTY;
        })
      ).subscribe();
    }
  }

  public onStart() {
    this.start.emit()
  }

  public onStop() {
    this.stop.emit()
  }

  public onSkip() {
    this.skip.emit()
  }

  public onUndoSkip() {
    this.undoSkip.emit()
  }

  public onPause() {
    this.pause.emit()
  }

  public onReset() {
    this.resetRace.emit()
  }

  public onGoogleTableClick() {
    this.googleTable.emit();
  }

  public generateAndDownloadJSON() {
    var theJSON = JSON.stringify(this.repositoryService.collectRaceData());
    this.downloadLink?.nativeElement.setAttribute("href", "data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    this.downloadLink?.nativeElement.setAttribute("download", "sync-data.json");

    this.downloadLink?.nativeElement.click();
  }
}
