import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from '../models/recipe.model';

export interface DietPlanItem {
  id: number;
  added_at: string;
  recipe: Recipe;
}

@Injectable({
  providedIn: 'root'
})
export class DietPlanService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getDietPlan(): Observable<DietPlanItem[]> {
    return this.http.get<DietPlanItem[]>(`${this.apiUrl}/diet-plan`);
  }

  addToDietPlan(recipeId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/diet-plan/add/${recipeId}`, {});
  }

  removeFromDietPlan(recipeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/diet-plan/remove/${recipeId}`);
  }
} 