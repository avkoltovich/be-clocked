import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {RepositoryService} from "../../services/repository.service";

@Component({
  selector: 'app-current-race-controls',
  templateUrl: './current-race-controls.component.html',
  styleUrls: ['./current-race-controls.component.scss']
})
export class CurrentRaceControlsComponent {
  public downloadJsonHref: string = '';

  @Input() isPauseAndSkipDisabled = true;

  @Input() isStartDisabled = true;

  @Input() isResetDisabled = true;

  @Output() start = new EventEmitter();

  @Output() skip = new EventEmitter();

  @Output() pause = new EventEmitter();

  @Output() reset = new EventEmitter();

  @ViewChild("download") downloadLink: ElementRef<HTMLAnchorElement> | undefined;

  constructor(private repositoryService: RepositoryService ) {}

  public onStart() {
    this.start.emit()
  }

  public onSkip() {
    this.skip.emit()
  }

  public onPause() {
    this.pause.emit()
  }

  public onReset() {
    this.reset.emit()
  }

  public generateAndDownloadJSON() {
    var theJSON = JSON.stringify(this.repositoryService.collectRaceData());
    this.downloadLink?.nativeElement.setAttribute("href", "data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    this.downloadLink?.nativeElement.setAttribute("download", "sync-data.json");

    this.downloadLink?.nativeElement.click();
  }
}
