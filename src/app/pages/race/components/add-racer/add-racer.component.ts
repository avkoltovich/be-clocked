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
    const currentList = this.racersService.registeredRacers$.value.slice();
    currentList.push(this.formGroup.controls.racer.value as string);
    this.racersService.registeredRacers$.next(currentList);

    this.formGroup.controls.racer.reset();
  }
}
