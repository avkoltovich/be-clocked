import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { AuthService } from "../../auth.service";
import { catchError, EMPTY, tap } from "rxjs";

@Component({
  selector: "be-clocked-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../../auth.module.scss"]
})
export class LoginComponent implements OnInit {
  public isHide = true;
  public isLoading = false;
  public login = new FormControl("", [Validators.required]);
  public password = new FormControl("", [Validators.required]);

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  public onLoginButtonClick() {
    this.isLoading = true;

    const user: AuthDto = {
      username: this.login.value!,
      password: this.password.value!
    };

    this.authService.login(user).pipe(
      tap((user) => {
        this.authService.authorize(user);
        this.isLoading = false;
      }),
      catchError(() => {
        this.isLoading = false;

        return EMPTY;
      })
    ).subscribe();
  }
}
