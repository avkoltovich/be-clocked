import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { RacersService } from "../../services/racers.service";
import { TUI_DEFAULT_MATCHER, tuiControlValue } from "@taiga-ui/cdk";
import { map } from "rxjs";

interface IFinisher {
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
      const difference = this.racersService.racers$.value.filter((racer) => {
        return !this.racersService.finishedRacers.includes(racer) && racer !== "Пропуск";
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
  }

  public onFinish() {
    const currentTime = Date.now();
    const currentRacer = this.formGroup.controls.racer.value;
    this.racerControl.setValue("");

    if (currentRacer !== null && currentRacer !== "") {
      this.racersService.finishedRacers.push(currentRacer);

      const finishers = this.finishers.slice();
      const racerIndex = this.racersService.racers$.value.indexOf(currentRacer);
      const actualTime = currentTime - this.racersService.getStartTimeFromLS() - racerIndex * this.racersService.racerSecondsDelta * 1000;

      finishers.push({
        name: currentRacer,
        time: actualTime
      });

      finishers.sort((a, b) => a.time - b.time);

      this.finishers = finishers.slice();
    }
  }

  public getTimeRemaining(t: number) {
    const mseconds = Math.floor(t % 1000);
    const seconds = Math.floor((t / 1000) % 60);
    const minutes = Math.floor((t / 1000 / 60) % 60);
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${mseconds.toString().padStart(3, "0")}`;
  };
}
