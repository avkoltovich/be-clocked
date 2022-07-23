import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  public login(user: AuthDto): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>("/api/auth/login", { ...user });
  }

  public create(user: AuthDto): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>("/api/auth/create", { ...user });
  }
}
