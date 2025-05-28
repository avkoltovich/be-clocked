import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RaceComponent } from "./race.component";

const routes: Routes = [
  {
    path: "",
    component: RaceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RaceRoutingModule {
}
