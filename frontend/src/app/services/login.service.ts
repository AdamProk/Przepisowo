import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { AuthTokenService } from './auth-token.service';

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authTokenService: AuthTokenService
  ) {
    if (this.isUserLoggedIn()) {
      this.loadCurrentUser();
    }
  }

  getAuthToken(): string | null {
    return this.authTokenService.getToken();
  }

  loadCurrentUser(): void {
    this.getCurrentUser().subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: (error) => console.error('Error loading user:', error)
    });
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login_check`, credentials).pipe(
      tap(response => {
        if (response.token) {
          this.authTokenService.setToken(response.token);
          this.loadCurrentUser();
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(newUser: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, newUser).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error('Failed to register user.'));
      })
    );
  }

  getCurrentUser(): Observable<User> {
    const token = this.getAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<User>(`${this.apiUrl}/me`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching user:', error);
        return throwError(() => new Error('Failed to fetch user data'));
      })
    );
  }

  getCurrentUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  getProfileImageUrl(profilePicture?: string): string {
    const user = this.getCurrentUserSync();
    if (user?.profilePicture) {
      return `http://localhost:8000/uploads/profile_pictures/${user.profilePicture}`;
    }
    return `http://localhost:8000/img/default/sample.png`;
  }

  isUserLoggedIn(): boolean {
    return this.authTokenService.hasToken();
  }

  logout(): void {
    this.authTokenService.removeToken();
    this.currentUserSubject.next(null);
  }

  isUserAdmin(): boolean {
    const user = this.getCurrentUserSync();
    return !!user?.adminPrivileges;
  }
}
