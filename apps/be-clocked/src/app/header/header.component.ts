import { Component, OnInit } from "@angular/core";
import { AuthService } from "../auth/auth.service";

@Component({
  selector: "be-clocked-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
  public isAuthorized$ = this.authService.isAuthorized$;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  public onLogoutClick() {
    this.authService.logout();
  }
}
