import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { AuthService } from "../../auth.service";
import { switchMap, tap } from "rxjs";

@Component({
  selector: "be-clocked-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../../auth.module.scss"]
})
export class LoginComponent implements OnInit {
  public login = new FormControl("", [Validators.required]);
  public password = new FormControl("", [Validators.required]);

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  public onLoginButtonClick() {
    const user: AuthDto = {
      username: this.login.value!,
      password: this.password.value!
    };

    this.authService.login(user).pipe(
      tap((data) => {
        console.log(data);
      }),
      switchMap((data) => {
        // @ts-ignore
        const token = data["access_token"];

        return this.authService.getProfile(token);
      })
    ).subscribe();
  }
}
