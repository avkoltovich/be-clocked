import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { catchError, EMPTY, map, startWith, tap } from "rxjs";
import { AuthService } from "../../auth.service";

@Component({
  selector: "be-clocked-register",
  templateUrl: "./register.component.html",
  styleUrls: ["../../auth.module.scss"]
})
export class RegisterComponent implements OnInit {
  public isHide = true;
  public isLoading = false;
  public authForm = new FormGroup({
    login: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required]),
    repeatedPassword: new FormControl("", [Validators.required])
  });

  public isInvalidForm$ = this.authForm.valueChanges.pipe(
    startWith(this.authForm.value),
    map(({ password, repeatedPassword }) => {
      if (password !== repeatedPassword) {
        this.authForm.get("repeatedPassword")?.setErrors({ incorrect: true });
      }

      return this.authForm.get("login")?.invalid || this.authForm.get("password")?.invalid || password !== repeatedPassword;
    })
  );

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  public onCreateButtonClick() {
    const username = this.authForm.get("login")?.value;
    const password = this.authForm.get("password")?.value;

    if (!username || !password) return;

    this.isLoading = true;
    this.authForm.disable();

    const user: AuthDto = {
      username,
      password
    };

    this.authService.create(user).pipe(
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
