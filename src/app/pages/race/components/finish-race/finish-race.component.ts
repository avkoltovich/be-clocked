import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { RacersService } from "../../services/racers.service";
import { TUI_DEFAULT_MATCHER, tuiControlValue } from "@taiga-ui/cdk";
import { map } from "rxjs";

export interface IFinisher {
  name: string;
  time: number;
}

@Component({
  selector: "app-finish-race",
  templateUrl: "./finish-race.component.html",
  styleUrls: ["./finish-race.component.scss"]
})
export class FinishRaceComponent {
  public racerControl = new FormControl("");
  public formGroup = new FormGroup({
    racer: this.racerControl
  });
  public finishers: IFinisher[] = [];

  public racers$ = tuiControlValue<string>(this.racerControl).pipe(
    map(value => {
      const difference = this.racersService.finisherListForSelect.filter((racer) => {
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

  constructor(private racersService: RacersService) {
    const finishersFromLS = this.racersService.readFinishersDataFromLS();

    if (finishersFromLS !== null) {
      this.finishers = finishersFromLS;
    }
  }

  public onFinish() {
    const currentTime = Date.now();
    const currentRacerName = this.formGroup.controls.racer.value;
    this.racerControl.setValue("");

    if (currentRacerName !== null && currentRacerName !== "") {
      this.racersService.finisherNameList.push(currentRacerName);
      this.racersService.updateFinisherNameListInLS(this.racersService.finisherNameList);

      const finishers = this.finishers.slice();
      const startedData = this.racersService.startedRacers.find((starter) => starter.name === currentRacerName);
      const actualTime = currentTime - startedData!.time;

      finishers.push({
        name: currentRacerName,
        time: actualTime
      });

      finishers.sort((a, b) => a.time - b.time);

      this.finishers = finishers.slice();
      this.racersService.updateFinishersDataInLS(this.finishers);
    }
  }

  public getTimeRemaining(t: number) {
    const mseconds = Math.floor(t % 1000);
    const seconds = Math.floor((t / 1000) % 60);
    const minutes = Math.floor((t / 1000 / 60) % 60);
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${mseconds.toString().padStart(3, "0")}`;
  };

  /**
   * TODO: Добавить логику АНОНИМА с возможностью замены на реального человека
   * TODO: Сохранение таймера при перезагрузке
   */
}
