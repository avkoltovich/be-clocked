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
    email: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required]),
    repeatedPassword: new FormControl("", [Validators.required]),
    name: new FormControl("", [Validators.required]),
    surname: new FormControl("", [Validators.required]),
    dob: new FormControl("", [Validators.required]),
    phone: new FormControl("", [Validators.required]),
    city: new FormControl("", [Validators.required]),
    team: new FormControl(""),
    gender: new FormControl("", [Validators.required])
  });

  public isInvalidForm$ = this.authForm.valueChanges.pipe(
    startWith(this.authForm.value),
    map(({ password, repeatedPassword }) => {
      if (password !== repeatedPassword) {
        this.authForm.get("repeatedPassword")?.setErrors({ incorrect: true });
      }

      return this.authForm.get("email")?.invalid || this.authForm.get("password")?.invalid || password !== repeatedPassword;
    })
  );

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  public onCreateButtonClick() {
    const email = this.authForm.get("email")?.value;
    const password = this.authForm.get("password")?.value;
    const name = this.authForm.get("name")?.value;
    const surname = this.authForm.get("surname")?.value;
    const dob = this.authForm.get("dob")?.value;
    const phone = this.authForm.get("phone")?.value;
    const city = this.authForm.get("city")?.value;
    const team = this.authForm.get("team")?.value;
    const gender = this.authForm.get("gender")?.value;

    if (
      !email
      || !password
      || !surname
      || !dob
      || !phone
      || !city
      || !team
      || !gender
      || !name
    ) return;

    this.isLoading = true;
    this.authForm.disable();

    const user: NewUser = {
      email,
      password,
      name,
      surname,
      dob,
      phone,
      city,
      team,
      gender: gender as Gender
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
