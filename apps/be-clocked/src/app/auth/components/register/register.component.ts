import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "be-clocked-register",
  templateUrl: "./register.component.html",
  styleUrls: ["../../auth.module.scss"]
})
export class RegisterComponent implements OnInit {
  public loginForm = new FormGroup({
    login: new FormControl(),
    password: new FormControl()
  });

  constructor() {
  }

  ngOnInit(): void {
  }
}
