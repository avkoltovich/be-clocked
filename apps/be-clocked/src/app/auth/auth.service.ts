import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { JWT_TOKEN, USER_ID, USER_LOGIN } from "../../../../../shared/constants";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  public isAuthorized$ = new BehaviorSubject(window.localStorage.getItem(JWT_TOKEN) !== undefined);

  constructor(private http: HttpClient, private router: Router) {
  }

  public login(user: AuthDto): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>("/api/auth/login", { ...user });
  }

  public create(user: AuthDto): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>("/api/auth/create", { ...user });
  }

  public logout(): void {
    window.localStorage.removeItem(JWT_TOKEN);
    window.localStorage.removeItem(USER_ID);
    window.localStorage.removeItem(USER_LOGIN);
    this.router.navigate(["login"]);

    setTimeout(() => {
      this.isAuthorized$.next(false);
    }, 1000);
  }

  public authorize(user: AuthenticatedUser) {
    window.localStorage.setItem(JWT_TOKEN, user.accessToken);
    window.localStorage.setItem(USER_LOGIN, user.username);
    window.localStorage.setItem(USER_ID, user.id.toString());
    this.isAuthorized$.next(true);
    this.router.navigate([""]);
  }
}
