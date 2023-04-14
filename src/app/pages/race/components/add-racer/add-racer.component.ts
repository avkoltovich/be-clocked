import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RacersService } from "../../services/racers.service";

@Component({
  selector: "app-add-racer",
  templateUrl: "./add-racer.component.html",
  styleUrls: ["./add-racer.component.scss"]
})
export class AddRacerComponent {
  public formGroup = new FormGroup({
    racer: new FormControl("", Validators.required),
    number: new FormControl("", Validators.required)
  });

  constructor(private racersService: RacersService) {
  }

  public onAddRacer() {
    const racerName = this.formGroup.controls.racer.value;
    const racerNumber = this.formGroup.controls.number.value;

    if (racerName === null || racerName === "") return;


    const currentList = this.racersService.racers$.value.slice();
    currentList.push(`${racerName} - ${racerNumber ?? ""}`);
    this.racersService.racers$.next(currentList);

    this.formGroup.controls.racer.reset();
  }
}
