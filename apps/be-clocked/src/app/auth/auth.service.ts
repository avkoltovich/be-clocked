import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  public login(user: { login: string, password: string }) {
    return this.http.post("/api/auth/login", { username: "john", password: "changeme" });
  }

  public getProfile(token: string) {
    const headers = new HttpHeaders({
      "Authorization": `Bearer ${token}`
    });

    return this.http.get("/api/profile", { headers });
  }
}
