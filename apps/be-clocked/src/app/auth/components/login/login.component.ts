import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
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
  public authForm = new FormGroup({
    email: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required])
  });

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  public onLoginButtonClick() {
    const email = this.authForm.get("email")?.value;
    const password = this.authForm.get("password")?.value;

    if (!email || !password) return;

    this.isLoading = true;
    this.authForm.disable();

    const user: AuthDto = {
      email,
      password
    };

    this.authService.login(user).pipe(
      tap((user) => {
        this.authService.authorize(user);
        this.isLoading = false;
        this.authForm.enable();
      }),
      catchError(() => {
        this.isLoading = false;
        this.authForm.enable();

        return EMPTY;
      })
    ).subscribe();
  }
}
