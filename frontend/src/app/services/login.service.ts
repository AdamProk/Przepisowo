import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginAPI= 'http://localhost/login';
  private registerAPI = 'http://localhost/register';

  constructor(private http: HttpClient) { }

  login(User: any): Observable<any> {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        // Add any other headers if needed
      },
      mode: 'no-cors', // Set request mode to 'no-cors'
    };
    return this.http.post<any>(`${this.loginAPI}`, User, options ).pipe(
        catchError(error => {
            console.error('Błąd przy logowaniu:', error);
            return throwError(()=> new Error('Złe dane.'));
        })
    );
  }

  register(newUser: any): Observable<any> {
    const headers = { 'Content-Type': 'application/ld+json' };

    return this.http.post<any>(`${this.registerAPI}`, newUser, { headers }).pipe(
        catchError(error => {
            console.error('Błąd przy rejestracji:', error);
            return throwError(()=> new Error('Nie udało się dodać użytkowanika.'));
        })
    );
}
  
}
