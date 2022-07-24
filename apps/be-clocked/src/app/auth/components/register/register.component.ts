import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { catchError, combineLatest, EMPTY, map, startWith, tap } from "rxjs";
import { AuthService } from "../../auth.service";

@Component({
  selector: "be-clocked-register",
  templateUrl: "./register.component.html",
  styleUrls: ["../../auth.module.scss"]
})
export class RegisterComponent implements OnInit {
  public isHide = true;
  public isLoading = false;
  public login = new FormControl("", [Validators.required]);
  public password = new FormControl("", [Validators.required]);
  public repeatedPassword = new FormControl("", [Validators.required]);

  public isInvalidForm = combineLatest([
    this.password.valueChanges.pipe(
      startWith(null)
    ),
    this.repeatedPassword.valueChanges.pipe(
      startWith(null)
    ),
    this.login.valueChanges.pipe(
      startWith(null)
    )
  ]).pipe(
    map(([password, repeatedPassword]) => {
      if (password !== repeatedPassword) {
        this.repeatedPassword.setErrors({ incorrect: true });
      }

      return this.login.invalid || this.password.invalid || password !== repeatedPassword;
    })
  );

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.isInvalidForm.subscribe();
  }

  public onCreateButtonClick() {
    this.isLoading = true;

    const user: AuthDto = {
      username: this.login.value!,
      password: this.password.value!
    };

    this.authService.create(user).pipe(
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
