import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { LoginService } from './login.service';
import { AuthTokenService } from './auth-token.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private authTokenService: AuthTokenService
  ) {}

  getCurrentUser(): Observable<User> {
    return this.loginService.getCurrentUser();
  }

  getCurrentUserSync(): User | null {
    return this.loginService.getCurrentUserSync();
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.authTokenService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  updateProfilePicture(formData: FormData): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/profile/picture`, formData, { headers }).pipe(
      tap(() => this.loginService.loadCurrentUser())
    );
  }

  getProfileImageUrl(profilePicture?: string): string {
    return this.loginService.getProfileImageUrl(profilePicture);
  }

  isUserLoggedIn(): boolean {
    return this.loginService.isUserLoggedIn();
  }

  isUserAdmin(): boolean {
    return this.loginService.isUserAdmin();
  }
} 
