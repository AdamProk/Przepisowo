import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScheduledMeal {
  id: number;
  recipe: {
    id: number;
    name: string;
    image: string;
    nutrients?: {
      calories: number;
      proteins?: number;
      carbohydrates?: number;
      fats?: number;
      vitamins?: string;
      minerals?: string;
    };
  };
  scheduledDate: string;
  mealType: string;
  portions: number;
  notes?: string;
}

export interface NutritionalOverview {
  total_calories: number;
  total_proteins: number;
  total_carbohydrates: number;
  total_fats: number;
  meals_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduledMealService {
  private apiUrl = 'http://localhost:8000/api/scheduled-meals';

  constructor(private http: HttpClient) { }

  scheduleMeal(data: {
    recipeId: number;
    scheduledDate: string;
    mealType: string;
    portions: number;
    notes?: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateScheduledMeal(id: number, data: {
    recipeId?: number;
    scheduledDate?: string;
    mealType?: string;
    portions?: number;
    notes?: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteScheduledMeal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getMealsInRange(startDate: string, endDate: string): Observable<ScheduledMeal[]> {
    return this.http.get<ScheduledMeal[]>(
      `${this.apiUrl}/user/range?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getNutritionalOverview(startDate: string, endDate: string): Observable<NutritionalOverview> {
    return this.http.get<NutritionalOverview>(
      `${this.apiUrl}/user/nutritional-overview?startDate=${startDate}&endDate=${endDate}`
    );
  }
} 