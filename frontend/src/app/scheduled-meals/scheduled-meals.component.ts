import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ScheduledMealService, ScheduledMeal, NutritionalOverview } from '../services/scheduled-meal.service';
import { NavComponent } from '../components/nav/nav.component';

@Component({
  selector: 'app-scheduled-meals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavComponent],
  templateUrl: './scheduled-meals.component.html',
  styleUrls: ['./scheduled-meals.component.css']
})
export class ScheduledMealsComponent implements OnInit {
  meals: ScheduledMeal[] = [];
  nutritionalOverview: NutritionalOverview | null = null;
  selectedDate: string = '';
  selectedMealType: string = 'all';
  mealTypes = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'breakfast', label: 'Śniadanie' },
    { value: 'lunch', label: 'Obiad' },
    { value: 'dinner', label: 'Kolacja' },
    { value: 'snack', label: 'Przekąska' }
  ];

  mealTypeMap: { [key: string]: string } = {
    'breakfast': 'Śniadanie',
    'lunch': 'Obiad',
    'dinner': 'Kolacja',
    'snack': 'Przekąska'
  };

  constructor(private scheduledMealService: ScheduledMealService) {
    // Set default date to today
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadMeals();
  }

  loadMeals(): void {
    // Create start and end date for the selected day (00:00 to 23:59)
    const startDate = new Date(this.selectedDate);
    const endDate = new Date(this.selectedDate);
    endDate.setHours(23, 59, 59, 999);

    this.scheduledMealService.getMealsInRange(startDate.toISOString(), endDate.toISOString())
      .subscribe({
        next: (meals) => {
          this.meals = meals;
          this.loadNutritionalOverview();
        },
        error: (error) => {
          console.error('Error loading meals:', error);
        }
      });
  }

  loadNutritionalOverview(): void {
    const startDate = new Date(this.selectedDate);
    const endDate = new Date(this.selectedDate);
    endDate.setHours(23, 59, 59, 999);

    this.scheduledMealService.getNutritionalOverview(startDate.toISOString(), endDate.toISOString())
      .subscribe({
        next: (overview) => {
          this.nutritionalOverview = overview;
        },
        error: (error) => {
          console.error('Error loading nutritional overview:', error);
        }
      });
  }

  onDateChange(): void {
    this.loadMeals();
  }

  getFilteredMeals(): ScheduledMeal[] {
    if (this.selectedMealType === 'all') {
      return this.meals;
    }
    return this.meals.filter(meal => meal.mealType === this.selectedMealType);
  }

  getMealTypeLabel(type: string): string {
    return this.mealTypeMap[type] || type;
  }

  deleteMeal(id: number): void {
    if (confirm('Are you sure you want to delete this scheduled meal?')) {
      this.scheduledMealService.deleteScheduledMeal(id)
        .subscribe({
          next: () => {
            this.meals = this.meals.filter(meal => meal.id !== id);
            this.loadNutritionalOverview();
          },
          error: (error) => {
            console.error('Error deleting meal:', error);
          }
        });
    }
  }

  getRecipeImageUrl(meal: ScheduledMeal): string {
    if (meal.recipe.image && meal.recipe.image !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${meal.recipe.image}`;
    }
    return 'http://localhost:8000/img/kotlet.jpg';
  }
} 