import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { combineLatest, map, startWith, tap } from "rxjs";
import { AuthService } from "../../auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "be-clocked-register",
  templateUrl: "./register.component.html",
  styleUrls: ["../../auth.module.scss"]
})
export class RegisterComponent implements OnInit {
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

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.isInvalidForm.subscribe();
  }

  public onCreateButtonClick() {
    const user: AuthDto = {
      username: this.login.value!,
      password: this.password.value!
    };

    this.authService.create(user).pipe(
      tap((user) => {
        this.authService.authorize(user);
      })
    ).subscribe();
  }
}
