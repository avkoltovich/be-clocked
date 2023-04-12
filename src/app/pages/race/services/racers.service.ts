import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class RacersService {
  public racers$ = new BehaviorSubject([
    "Константиновский Константин",
    "Eric Idle",
    "Michael Palin",
    "Terry Gilliam",
    "Terry Jones",
    "Graham Chapman"
  ]);

  constructor() {
  }
}
