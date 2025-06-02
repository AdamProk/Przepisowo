import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Cuisine {
  id: number;
  cuisine: string;
}

@Injectable({
  providedIn: 'root'
})
export class CuisineService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getCuisines(): Observable<Cuisine[]> {
    return this.http.get<Cuisine[]>(`${this.apiUrl}/cuisines`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching cuisines:', error);
        return throwError(() => new Error('Unable to load cuisines. Please try again later.'));
      })
    );
  }
} 