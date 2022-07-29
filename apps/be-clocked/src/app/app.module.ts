import { Injectable, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { HeaderModule } from "./header/header.module";
import { FooterModule } from "./footer/footer.module";
import { AuthModule } from "./auth/auth.module";
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {

  override parse(value: any): Date | null {
    if ((typeof value === "string") && (value.indexOf(".") > -1)) {
      const str = value.split(".");

      const year = Number(str[2]);
      const month = Number(str[1]) - 1;
      const date = Number(str[0]);

      return new Date(year, month, date);
    }

    const timestamp = typeof value === "number" ? value : Date.parse(value);

    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  override format(date: any, displayFormat: any): string {
    date = new Date(Date.UTC(
      date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(),
      date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
    displayFormat = Object.assign({}, displayFormat, { timeZone: "utc" });

    const dtf = new Intl.DateTimeFormat(this.locale, displayFormat);
    return dtf.format(date).replace(/[\u200e\u200f]/g, "");
  }

  override getFirstDayOfWeek(): number {
    return 1;
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, BrowserAnimationsModule, AppRoutingModule, HeaderModule, FooterModule, AuthModule, MatDatepickerModule,
    MatNativeDateModule],
  providers: [
    MatDatepickerModule,
    MatNativeDateModule,
    {
      provide: MAT_DATE_LOCALE,
      useValue: "ru-RU"
    },
    {
      provide: DateAdapter,
      useClass: CustomDateAdapter
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
