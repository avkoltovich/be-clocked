import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { API_URL, JWT_TOKEN, USER_EMAIL, USER_ID } from "../../../../../shared/constants";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  public isAuthorized$ = new BehaviorSubject(window.localStorage.getItem(JWT_TOKEN) !== null);

  constructor(private http: HttpClient, private router: Router) {
  }

  public login(user: AuthDto): Observable<AuthenticatedUser> {
    const headers = new HttpHeaders();

    return this.http.post<AuthenticatedUser>(`${API_URL}/auth/login`, { ...user }, { headers });
  }

  public create(user: NewUser): Observable<AuthenticatedUser> {
    const headers = new HttpHeaders();

    return this.http.post<AuthenticatedUser>(`${API_URL}/auth/create`, { ...user }, { headers });
  }

  public logout(): void {
    window.localStorage.removeItem(JWT_TOKEN);
    window.localStorage.removeItem(USER_ID);
    window.localStorage.removeItem(USER_EMAIL);
    setTimeout(() => {
      this.isAuthorized$.next(false);
      this.router.navigate(["login"]);
    }, 300);
  }

  public authorize(user: AuthenticatedUser) {
    window.localStorage.setItem(JWT_TOKEN, user.accessToken);
    window.localStorage.setItem(USER_EMAIL, user.email);
    window.localStorage.setItem(USER_ID, user.id.toString());
    this.isAuthorized$.next(true);
    this.router.navigate([""]);
  }
}
