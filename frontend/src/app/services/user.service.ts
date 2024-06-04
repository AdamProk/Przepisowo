import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = 'http://localhost:8000/api/me';
  private currUserSubject = new BehaviorSubject<any>(null);
  public currUser$ = this.currUserSubject.asObservable();

  private userLoggedInSource = new Subject<void>();
  userLoggedIn$ = this.userLoggedInSource.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
    this.userLoggedIn$.subscribe(() => {
        this.loadUser();
    });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.api}`).pipe(
        catchError(error => {
            console.error('Error fetching JSON data:', error);
            return throwError(() => new Error('Something went wrong; please try again later.'));
        })
    );
  }

  private loadUser(): void {
    if (typeof localStorage !== 'undefined') {
        if (localStorage.getItem('authToken')) {
            this.getCurrentUser().subscribe({
                next: user => this.currUserSubject.next(user),
                error: error => console.error('Error fetching user:', error)
            });
        }
    }
  }

  public getCurrentUserSync(): any {
    return this.currUserSubject.value;
  }

  public isUserLoggedIn(): boolean {
      return !!this.currUserSubject.value;
  }

  public isUserAdmin(): boolean {
      const user = this.currUserSubject.value;
      return user ? user.adminPrivileges : false;
  }

  notifyUserLoggedIn() {
      this.userLoggedInSource.next();
  }

} 
