import { Component } from "@angular/core";

@Component({
  selector: "app-racer-list",
  templateUrl: "./racer-list.component.html",
  styleUrls: ["./racer-list.component.scss"]
})
export class RacerListComponent {
  items: readonly string[] = [
    "John Cleese",
    "Eric Idle",
    "Michael Palin",
    "Terry Gilliam",
    "Terry Jones",
    "Graham Chapman"
  ];

  enabled = this.items;
}
