import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { RacersService } from "../../services/racers.service";

@Component({
  selector: "app-add-racer",
  templateUrl: "./add-racer.component.html",
  styleUrls: ["./add-racer.component.scss"]
})
export class AddRacerComponent {
  public formGroup = new FormGroup({
    racer: new FormControl("")
  });

  constructor(private racersService: RacersService) {
  }

  public onAddRacer() {
    const racerName = this.formGroup.controls.racer.value;

    if (racerName === null || racerName === "") return;

    const currentList = this.racersService.racers$.value.slice();
    currentList.push(racerName);
    this.racersService.racers$.next(currentList);

    this.formGroup.controls.racer.reset();
  }
}
