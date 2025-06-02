import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Recipe } from '../models/recipe.model';

interface Comment {
  content: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  private getHeaders(requiresAuth: boolean = true): HttpHeaders {
    let headers = new HttpHeaders();
    if (requiresAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  getRecipes(): Observable<Recipe[]> {
    // Public endpoint - no auth required
    const headers = this.getHeaders(false);
    return this.http.get<Recipe[]>(`${this.apiUrl}/recipes/all`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching recipes:', error);
        return throwError(() => new Error('Something went wrong; please try again later.'));
      })
    );
  }

  getRecipe(id: number): Observable<Recipe> {
    // Public endpoint - no auth required
    const headers = this.getHeaders(false);
    return this.http.get<Recipe>(`${this.apiUrl}/recipe/${id}`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching recipe:', error);
        return throwError(() => new Error('Something went wrong; please try again later.'));
      })
    );
  }

  addRecipe(formData: FormData): Observable<any> {
    // Protected endpoint - requires auth
    const headers = this.getHeaders(true);
    return this.http.post(`${this.apiUrl}/addrecipe`, formData, { headers }).pipe(
      catchError(error => {
        console.error('Error adding recipe:', error);
        return throwError(() => new Error('Something went wrong; please try again later.'));
      })
    );
  }

  addComment(recipeId: number, comment: Comment): Observable<any> {
    // Protected endpoint - requires auth
    const headers = this.getHeaders(true);
    const payload = {
      rating: comment.rating,
      comment: comment.content
    };

    return this.http.post(`${this.apiUrl}/recipe/${recipeId}/comment`, payload, { headers });
  }

  updateRecipeImage(recipeId: number, formData: FormData): Observable<{ message: string; recipePicture: string }> {
    // Protected endpoint - requires auth
    const headers = this.getHeaders(true);
    return this.http.post<{ message: string; recipePicture: string }>(
      `${this.apiUrl}/recipe/${recipeId}/image`, 
      formData, 
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error updating recipe image:', error);
        return throwError(() => new Error('Failed to update recipe image'));
      })
    );
  }
}
