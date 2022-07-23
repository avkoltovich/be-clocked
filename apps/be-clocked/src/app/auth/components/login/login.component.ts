import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { AuthService } from "../../auth.service";
import { tap } from "rxjs";
import { JWT_TOKEN, USER_ID, USER_LOGIN } from "../../../../../../../shared/constants";

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
      tap((user) => {
        window.localStorage.setItem(JWT_TOKEN, user.accessToken);
        window.localStorage.setItem(USER_LOGIN, user.username);
        window.localStorage.setItem(USER_ID, user.id.toString());
      })
    ).subscribe();
  }
}
