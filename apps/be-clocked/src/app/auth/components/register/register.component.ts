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
  public minDate: Date = new Date("1986-06-20T00:00:00");
  public authForm = new FormGroup({
    email: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required]),
    repeatedPassword: new FormControl("", [Validators.required]),
    name: new FormControl("", [Validators.required]),
    surname: new FormControl("", [Validators.required]),
    dob: new FormControl("1986-06-20T00:00:00", [Validators.required]),
    phone: new FormControl("", [Validators.required]),
    city: new FormControl("", [Validators.required]),
    team: new FormControl(""),
    gender: new FormControl("", [Validators.required]),
    personalData: new FormControl(true, [Validators.required])
  });

  public isInvalidForm$ = this.authForm.valueChanges.pipe(
    startWith(this.authForm.value),
    map(({ password, repeatedPassword }) => {
      if (password !== repeatedPassword) {
        this.authForm.get("repeatedPassword")?.setErrors({ incorrect: true });
      }

      return this.authForm.invalid || !this.authForm.get("personalData")?.value || password !== repeatedPassword;
    })
  );

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  public onCreateButtonClick() {
    const email = this.authForm.get("email")?.value?.trim().toLowerCase();
    const password = this.authForm.get("password")?.value;
    const name = this.authForm.get("name")?.value?.trim();
    const surname = this.authForm.get("surname")?.value?.trim();
    const dob = new Date(this.authForm.get("dob")?.value!);
    const phone = this.authForm.get("phone")?.value?.replace(/\D/g, "");
    const city = this.authForm.get("city")?.value?.trim();
    const team = this.authForm.get("team")?.value?.trim();
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

    const dobString = `${dob.getDate().toString().padStart(2, "0")}.${(dob.getMonth() + 1).toString().padStart(2, "0")}.${dob.getFullYear()}`;

    this.isLoading = true;
    this.authForm.disable();

    const user: NewUser = {
      email,
      password,
      name,
      surname,
      dob: dobString,
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
