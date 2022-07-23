import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { tap } from "rxjs";
import { AuthService } from "../../auth.service";

@Component({
  selector: "be-clocked-register",
  templateUrl: "./register.component.html",
  styleUrls: ["../../auth.module.scss"]
})
export class RegisterComponent implements OnInit {
  public createForm = new FormGroup({
    login: new FormControl(),
    password: new FormControl()
  });

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  public onCreateButtonClick() {
    const user: AuthDto = {
      username: this.createForm.get("login")?.value,
      password: this.createForm.get("password")?.value
    };

    this.authService.create(user).pipe(
      tap((data) => {
        console.log(data);
      })
    ).subscribe();
  }
}
