import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  public login(user: CreateUserDto) {
    return this.http.post("/api/auth/login", { ...user });
  }

  public getProfile(token: string) {
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${token}`
    });

    return this.http.get("/api/profile", { headers });
  }
}
