import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  private addCommentUrl = 'http://localhost:8000/api/recipe';
  constructor(private http: HttpClient) {}

  commentRecipe(formData: any): Observable<any> {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        // Add any other headers if needed
      },
      mode: 'no-cors', // Set request mode to 'no-cors'
    };
    return this.http.post<any>(`${this.addCommentUrl}`, formData, options ).pipe(
      map(response => {
        if (response.status === 200) {
          return response.body;
        } else {
          throw new Error('Unexpected status code: ' + response.status);
        }
      })
    );
  }

}
