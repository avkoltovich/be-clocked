import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { AuthService } from "../../auth.service";
import { switchMap, tap } from "rxjs";

@Component({
  selector: "be-clocked-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../../auth.module.scss"]
})
export class LoginComponent implements OnInit {
  public loginForm = new FormGroup({
    login: new FormControl(),
    password: new FormControl()
  });

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  public onLoginButtonClick() {
    const user: CreateUserDto = {
      username: this.loginForm.get("login")?.value,
      password: this.loginForm.get("password")?.value
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
