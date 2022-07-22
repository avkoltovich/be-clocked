import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FooterComponent } from "./footer.component";
import { MatToolbarModule } from "@angular/material/toolbar";

@NgModule({
  declarations: [FooterComponent],
  exports: [
    FooterComponent
  ],
  imports: [CommonModule, MatToolbarModule]
})
export class FooterModule {
}
