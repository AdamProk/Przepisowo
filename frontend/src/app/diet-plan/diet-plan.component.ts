import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DietPlanService, DietPlanItem } from '../services/diet-plan.service';
import { NavComponent } from '../components/nav/nav.component';
import { Recipe } from '../models/recipe.model';
import { FormsModule } from '@angular/forms';
import { ScheduledMealService } from '../services/scheduled-meal.service';

@Component({
  selector: 'app-diet-plan',
  standalone: true,
  imports: [CommonModule, RouterLink, NavComponent, FormsModule],
  template: `
    <app-nav></app-nav>
    <div class="container">
      <h2>Planer diety</h2>
      
      <!-- Search and Filter Section -->
      <div class="filters-section">
        <div class="search-bar">
          <input 
            type="text" 
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            placeholder="Wyszukaj przepis">
        </div>

        <div class="filter-row">
          <div class="sort-section">
            <label>Sortuj według:</label>
            <select [(ngModel)]="sortBy" (change)="applyFilters()">
              <option value="name">Nazwy</option>
              <option value="calories">Kalorii</option>
              <option value="prepTime">Czasu przygotowania</option>
              <option value="addedDate">Daty dodania</option>
            </select>
            <select [(ngModel)]="sortDirection" (change)="applyFilters()">
              <option value="asc">Rosnąco</option>
              <option value="desc">Malejąco</option>
            </select>
          </div>

          <div class="cuisine-filter">
            <label>Kuchnia:</label>
            <select [(ngModel)]="selectedCuisine" (change)="applyFilters()">
              <option value="">Wszystkie</option>
              @for (cuisine of availableCuisines; track cuisine) {
                <option [value]="cuisine">{{cuisine}}</option>
              }
            </select>
          </div>
        </div>

        <div class="calorie-filters">
          <div class="calorie-input">
            <label>Min. kalorie:</label>
            <input 
              type="number" 
              [(ngModel)]="minCalories"
              (input)="applyFilters()"
              placeholder="Min kalorie">
          </div>
          <div class="calorie-input">
            <label>Max. kalorie:</label>
            <input 
              type="number" 
              [(ngModel)]="maxCalories"
              (input)="applyFilters()"
              placeholder="Max kalorie">
          </div>
        </div>
      </div>

      <div class="recipes">
        @for (item of filteredDietPlanItems; track item.id) {
          <div class="recipe-container">
            <div class="recipe">
              <div class="recipe_left">
                <div class="recipe_img">
                  <img class="search_img" [src]="getRecipeImageUrl(item.recipe)" [alt]="item.recipe.recipeName || item.recipe.name">
                </div>
              </div>
              <div class="recipe_right">
                <div class="recipe_top">
                  <h1>{{item.recipe.recipeName || item.recipe.name || 'Untitled Recipe'}}</h1>
                </div>
                <div class="recipe_bottom">
                  <div class="recipe_info">
                    <div class="recipe_stats">
                      <div class="recipe_stat_item">
                        <p>Czas przygotowania: {{item.recipe.prepTime || item.recipe.time || '0'}} min</p>
                      </div>
                      <div class="recipe_stat_item">
                        <p>Ilość porcji: {{item.recipe.amount || '0'}}</p>
                      </div>
                      <div class="recipe_stat_item">
                        <p>Kuchnia: {{getRecipeCuisines(item.recipe)}}</p>
                      </div>
                    </div>
                    <div class="nutrients-section">
                      <div class="nutrients-grid">
                        <div class="nutrient-item">
                          <span class="nutrient-label">Kalorie:</span>
                          <span class="nutrient-value">{{item.recipe.nutrients?.calories || '0'}} kcal</span>
                        </div>
                        <div class="nutrient-item">
                          <span class="nutrient-label">Białko:</span>
                          <span class="nutrient-value">{{item.recipe.nutrients?.proteins || '0'}} g</span>
                        </div>
                        <div class="nutrient-item">
                          <span class="nutrient-label">Węglowodany:</span>
                          <span class="nutrient-value">{{item.recipe.nutrients?.carbohydrates || '0'}} g</span>
                        </div>
                        <div class="nutrient-item">
                          <span class="nutrient-label">Tłuszcze:</span>
                          <span class="nutrient-value">{{item.recipe.nutrients?.fats || '0'}} g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="recipe-actions">
                  <button class="remove-btn" (click)="removeFromDietPlan(item.recipe.id)">Usuń z planera</button>
                  <button class="schedule-btn" (click)="openScheduleDialog(item.recipe)">Zaplanuj posiłek</button>
                  <button class="show-recipe-btn" [routerLink]="['/recipe', item.recipe.id]">Pokaż przepis</button>
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <p class="no-recipes">Nie masz jeszcze żadnych przepisów w planerze diety.</p>
        }
      </div>
    </div>

    <!-- Schedule Meal Dialog -->
    @if (showScheduleDialog) {
      <div class="dialog-overlay" (click)="closeScheduleDialog()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <h2>Zaplanuj posiłek</h2>
          <div class="dialog-content">
            <div class="form-group">
              <label>Data i godzina:</label>
              <input type="datetime-local" [(ngModel)]="scheduleForm.scheduledDate">
            </div>
            <div class="form-group">
              <label>Typ posiłku:</label>
              <select [(ngModel)]="scheduleForm.mealType">
                <option value="">Wybierz typ posiłku</option>
                <option value="breakfast">Śniadanie</option>
                <option value="lunch">Obiad</option>
                <option value="dinner">Kolacja</option>
                <option value="snack">Przekąska</option>
              </select>
            </div>
            <div class="form-group">
              <label>Liczba porcji:</label>
              <input type="number" [(ngModel)]="scheduleForm.portions" min="0.5" step="0.5">
            </div>
            <div class="form-group">
              <label>Notatki:</label>
              <textarea [(ngModel)]="scheduleForm.notes"></textarea>
            </div>
          </div>
          <div class="dialog-actions">
            <button class="cancel-btn" (click)="closeScheduleDialog()">Anuluj</button>
            <button class="confirm-btn" (click)="scheduleMeal()">Zaplanuj</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .container {
      width: 80%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .filters-section {
      width: 80%;
      margin: 0 auto 20px;
      padding: 20px;
      background-color: #55FFA3;
      border-radius: 8px;
      border: 1px solid black;
    }

    .search-bar {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .search-bar input {
      width: 100%;
      max-width: 800px;
      padding: 10px;
      border: 1px solid black;
      border-radius: 4px;
      font-size: 16px;
      background-color: white;
    }

    .filter-row {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
    }

    .sort-section, .cuisine-filter {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sort-section select, .cuisine-filter select {
      padding: 8px;
      border: 1px solid black;
      border-radius: 4px;
      font-size: 16px;
      background-color: white;
    }

    .sort-section label, .cuisine-filter label {
      font-weight: 500;
      color: black;
    }

    .calorie-filters {
      display: flex;
      justify-content: center;
      gap: 20px;
    }

    .calorie-input {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .calorie-input label {
      font-size: 16px;
      color: black;
      font-weight: 500;
    }

    .calorie-input input {
      padding: 8px;
      border: 1px solid black;
      border-radius: 4px;
      font-size: 16px;
      width: 120px;
      background-color: white;
    }

    h2 {
      text-align: center;
      color: black;
      margin-bottom: 30px;
      font-size: 2em;
    }

    .recipes {
      width: 80%;
      margin: 0 auto;
      max-height: calc(100vh - 300px);
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 20px;
      box-sizing: border-box;
      margin-bottom: 10vh;
    }

    .recipe-container {
      width: 100%;
      max-width: 1000px;
      background-color: #55FFA3;
      border: 1px solid black;
      border-radius: 8px;
      overflow: visible;
      transition: transform 0.2s;
      cursor: pointer;
      margin: 0;
      padding: 15px;
      box-sizing: border-box;
    }

    .recipe-container:hover {
      transform: translateY(-5px);
    }

    .recipe {
      display: flex;
      gap: 20px;
      width: 100%;
      box-sizing: border-box;
      overflow: visible;
      min-height: 160px;
    }

    .recipe_left {
      width: 200px;
      min-width: 200px;
      height: 140px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .recipe_img {
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 4px;
      border: 1px solid black;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .search_img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .recipe_right {
      flex: 1;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }

    .recipe_top h1 {
      margin: 0;
      color: black;
      font-size: 20px;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .recipe_bottom {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }

    .recipe_info {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .recipe_stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .recipe_stat_item {
      font-size: 12px;
      color: black;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .recipe_stat_item p {
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .nutrients-section {
      background-color: #39F383;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid black;
      min-width: 0;
    }

    .nutrients-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .nutrient-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 8px;
      color: black;
      font-size: 12px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      border: 1px solid black;
      overflow: hidden;
    }

    .nutrient-label, .nutrient-value {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .recipe-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: auto;
      flex-wrap: wrap;
    }

    .remove-btn, .schedule-btn, .show-recipe-btn {
      background: #05c435;
      box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25);
      border-radius: 0.4em;
      height: 2em;
      width: auto;
      min-width: 8em;
      max-width: 12em;
      border: none;
      color: white;
      margin: 0.3em;
      padding: 0 0.8em;
      line-height: 2em;
      font-size: 1em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .remove-btn {
      background: red;
    }

    .remove-btn:hover, .schedule-btn:hover, .show-recipe-btn:hover {
      font-weight: bold;
    }

    .no-recipes {
      text-align: center;
      width: 100%;
      max-width: 1000px;
      padding: 20px;
      background-color: #55FFA3;
      border-radius: 8px;
      border: 1px solid black;
      color: black;
    }

    ::-webkit-scrollbar {
      display: none;
    }

    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .dialog {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      min-width: 300px;
      max-width: 500px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border: 1px solid black;
    }

    .dialog h2 {
      margin: 0 0 20px 0;
      font-size: 1.5em;
      color: black;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 500;
      color: black;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 8px;
      border: 1px solid black;
      border-radius: 4px;
      font-size: 14px;
      background-color: white;
    }

    .form-group textarea {
      min-height: 80px;
      resize: vertical;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    .cancel-btn,
    .confirm-btn {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .cancel-btn {
      background-color: #f5f5f5;
      color: black;
      border: 1px solid black;
    }

    .cancel-btn:hover {
      background-color: #e5e5e5;
    }

    .confirm-btn {
      background-color: #39F383;
      color: black;
      border: 1px solid black;
    }

    .confirm-btn:hover {
      background-color: #2dd36f;
    }

    @media (max-width: 768px) {
      .container {
        width: 95%;
      }

      .filters-section {
        width: 95%;
      }

      .filter-row {
        flex-direction: column;
      }

      .recipe {
        flex-direction: column;
      }

      .recipe_left {
        width: 100%;
        height: 200px;
      }

      .recipe_img {
        height: 100%;
      }

      .recipe-actions {
        flex-direction: column;
      }

      .remove-btn, .schedule-btn, .show-recipe-btn {
        width: 100%;
        margin: 0.5em 0;
      }
    }
  `]
})
export class DietPlanComponent implements OnInit {
  dietPlanItems: DietPlanItem[] = [];
  filteredDietPlanItems: DietPlanItem[] = [];
  searchQuery: string = '';
  minCalories: number | null = null;
  maxCalories: number | null = null;

  // Schedule dialog properties
  showScheduleDialog: boolean = false;
  selectedRecipe: Recipe | null = null;
  scheduleForm = {
    scheduledDate: '',
    mealType: '',
    portions: 1,
    notes: ''
  };

  sortBy: string = 'name';
  sortDirection: string = 'asc';
  selectedCuisine: string = '';
  availableCuisines: string[] = [];

  constructor(
    private dietPlanService: DietPlanService,
    private scheduledMealService: ScheduledMealService
  ) {
    // Set default date to current time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.scheduleForm.scheduledDate = now.toISOString().slice(0, 16);
  }

  ngOnInit() {
    this.loadDietPlan();
  }

  loadDietPlan() {
    this.dietPlanService.getDietPlan().subscribe({
      next: (items) => {
        this.dietPlanItems = items;
        this.extractAvailableCuisines();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading diet plan:', error);
      }
    });
  }

  extractAvailableCuisines() {
    const cuisineSet = new Set<string>();
    this.dietPlanItems.forEach(item => {
      if (item.recipe.cuisines && Array.isArray(item.recipe.cuisines)) {
        item.recipe.cuisines.forEach((cuisineObj: { cuisine: string }) => {
          if (cuisineObj && cuisineObj.cuisine) {
            cuisineSet.add(cuisineObj.cuisine);
          }
        });
      }
    });
    this.availableCuisines = Array.from(cuisineSet).sort();
  }

  getRecipeCuisines(recipe: any): string {
    if (recipe.cuisines && Array.isArray(recipe.cuisines)) {
      return recipe.cuisines.map((c: { cuisine: string }) => c.cuisine).join(', ');
    }
    return 'Brak informacji';
  }

  applyFilters() {
    let filtered = [...this.dietPlanItems];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.recipe.recipeName || item.recipe.name || '').toLowerCase().includes(query)
      );
    }

    // Apply cuisine filter
    if (this.selectedCuisine) {
      filtered = filtered.filter(item => 
        item.recipe.cuisines && 
        Array.isArray(item.recipe.cuisines) && 
        item.recipe.cuisines.some((c: { cuisine: string }) => c.cuisine === this.selectedCuisine)
      );
    }

    // Apply calorie filters
    if (this.minCalories && this.minCalories > 0) {
      filtered = filtered.filter(item => {
        const calories = item.recipe?.nutrients?.calories ?? 0;
        return calories >= (this.minCalories ?? 0);
      });
    }
    if (this.maxCalories && this.maxCalories > 0) {
      filtered = filtered.filter(item => {
        const calories = item.recipe?.nutrients?.calories ?? 0;
        return calories <= (this.maxCalories ?? 0);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'name':
          valueA = (a.recipe.recipeName || a.recipe.name || '').toLowerCase();
          valueB = (b.recipe.recipeName || b.recipe.name || '').toLowerCase();
          break;
        case 'calories':
          valueA = a.recipe.nutrients?.calories ?? 0;
          valueB = b.recipe.nutrients?.calories ?? 0;
          break;
        case 'prepTime':
          valueA = a.recipe.prepTime || a.recipe.time || 0;
          valueB = b.recipe.prepTime || b.recipe.time || 0;
          break;
        case 'addedDate':
          valueA = new Date(a.added_at || 0).getTime();
          valueB = new Date(b.added_at || 0).getTime();
          break;
        default:
          valueA = a.recipe.recipeName || '';
          valueB = b.recipe.recipeName || '';
      }

      const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredDietPlanItems = filtered;
  }

  getRecipeImageUrl(recipe: Recipe): string {
    if (recipe.recipePicture && recipe.recipePicture !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${recipe.recipePicture}`;
    } else if (recipe.image && recipe.image !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${recipe.image}`;
    }
    return 'http://localhost:8000/img/kotlet.jpg';
  }

  removeFromDietPlan(recipeId: number) {
    this.dietPlanService.removeFromDietPlan(recipeId).subscribe({
      next: () => {
        this.dietPlanItems = this.dietPlanItems.filter(item => item.recipe.id !== recipeId);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error removing recipe from diet plan:', error);
      }
    });
  }

  openScheduleDialog(recipe: Recipe): void {
    this.selectedRecipe = recipe;
    this.showScheduleDialog = true;
  }

  closeScheduleDialog(): void {
    this.showScheduleDialog = false;
    this.selectedRecipe = null;
    this.scheduleForm = {
      scheduledDate: new Date().toISOString().slice(0, 16),
      mealType: '',
      portions: 1,
      notes: ''
    };
  }

  scheduleMeal(): void {
    if (!this.selectedRecipe || !this.scheduleForm.scheduledDate || !this.scheduleForm.mealType) {
      return;
    }

    this.scheduledMealService.scheduleMeal({
      recipeId: this.selectedRecipe.id,
      scheduledDate: this.scheduleForm.scheduledDate,
      mealType: this.scheduleForm.mealType,
      portions: this.scheduleForm.portions,
      notes: this.scheduleForm.notes
    }).subscribe({
      next: () => {
        this.closeScheduleDialog();
        // Show success message or notification
      },
      error: (error) => {
        console.error('Error scheduling meal:', error);
        // Show error message
      }
    });
  }
} 