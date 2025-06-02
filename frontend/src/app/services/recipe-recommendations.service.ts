import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from '../models/recipe.model';

export interface RecipeRecommendation {
  recipe: Recipe;
  matchScore: number;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeRecommendationsService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getPersonalizedRecommendations(): Observable<RecipeRecommendation[]> {
    const params = new HttpParams().set('timestamp', Date.now().toString());
    return this.http.get<RecipeRecommendation[]>(
      `${this.apiUrl}/recommendations/personalized`,
      { 
        headers: this.getHeaders(),
        params: params
      }
    );
  }

  getCuisineBasedRecommendations(): Observable<RecipeRecommendation[]> {
    const params = new HttpParams().set('timestamp', Date.now().toString());
    return this.http.get<RecipeRecommendation[]>(
      `${this.apiUrl}/recommendations/cuisine-based`,
      { 
        headers: this.getHeaders(),
        params: params
      }
    );
  }

  getNutritionalRecommendations(): Observable<RecipeRecommendation[]> {
    const params = new HttpParams().set('timestamp', Date.now().toString());
    return this.http.get<RecipeRecommendation[]>(
      `${this.apiUrl}/recommendations/nutritional`,
      { 
        headers: this.getHeaders(),
        params: params
      }
    );
  }
} 