import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private recipeUrl='http://localhost:8000/api/recipe';
  private addRecipeUrl='http://localhost:8000/api/addrecipe';
  private allRecipesUrl='http://localhost:8000/api/recipes/all';

  constructor(private http: HttpClient) {}

  getRecipe(recipeId: number): Observable<any> {
    return this.http.get<any>(`${this.recipeUrl}/${recipeId}`).pipe(
        catchError(error => {
            console.error('Error fetching JSON data:', error);
            return throwError(()=> new Error('Something went wrong; please try again later.'));
        })
    );
  }
  getRecipes(): Observable<any[]> {
    return this.http.get<any[]>(this.allRecipesUrl).pipe(
      catchError(error => {
          console.error('Error fetching recipe: ', error);
          return throwError(()=> new Error('Couldnt fetch recipe'));
      })
  );
  }
  addRecipe(formData: any): Observable<any> {
    return this.http.post<any>(`${this.addRecipeUrl}`, formData, { observe: 'response' }).pipe(
      map(response => {
        if (response.status === 201) {
          return response.body;
        } else {
          throw new Error('Unexpected status code: ' + response.status);
        }
      })
    );
  }

}
