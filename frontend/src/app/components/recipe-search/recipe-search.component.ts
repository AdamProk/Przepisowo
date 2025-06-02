import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuisineService } from '../../services/cuisine.service';

@Component({
  selector: 'app-recipe-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
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
            <option value="date">Daty dodania</option>
            <option value="rating">Oceny</option>
            <option value="comments">Liczby ocen</option>
            <option value="diet_plan">Ilość dodań do planera</option>
          </select>
          <select [(ngModel)]="sortDirection" (change)="applyFilters()">
            <option value="desc">Malejąco</option>
            <option value="asc">Rosnąco</option>
          </select>
        </div>

        <div class="cuisine-filter">
          <label>Kuchnia:</label>
          <select [(ngModel)]="selectedCuisine" (change)="applyFilters()">
            <option value="all">Wszystkie</option>
            @for (cuisine of availableCuisines; track cuisine) {
              <option [value]="cuisine.cuisine">{{cuisine.cuisine}}</option>
            }
          </select>
        </div>
      </div>

      @if (errorMessage) {
        <div class="error-message">
          {{ errorMessage }}
        </div>
      }
    </div>
  `,
  styles: [`
    .filters-section {
      width: 125%;
      margin-left: -12.5%;
      margin-right: -12.5%;
      margin-bottom: 20px;
      padding: 20px;
      background-color: #55FFA3;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: relative;
    }

    .search-bar {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .search-bar input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    .filter-row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 20px;
      width: 100%;
      flex-wrap: wrap;
    }

    .sort-section, .cuisine-filter {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 300px;
    }

    .sort-section {
      display: flex;
      gap: 10px;
      flex: 2;
    }

    .sort-section select {
      min-width: 150px;
      flex: 1;
    }

    .cuisine-filter {
      flex: 1;
    }

    .cuisine-filter select {
      flex: 1;
    }

    .sort-section select, .cuisine-filter select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      background-color: white;
    }

    .sort-section label, .cuisine-filter label {
      font-weight: 500;
      color: #333;
      white-space: nowrap;
      min-width: fit-content;
    }

    .error-message {
      margin-top: 10px;
      padding: 10px;
      background-color: #ffe6e6;
      border: 1px solid #ff9999;
      border-radius: 4px;
      color: #cc0000;
      text-align: center;
    }
  `]
})
export class RecipeSearchComponent implements OnInit {
  @Output() searchChange = new EventEmitter<{
    query: string;
    sortBy: string;
    sortDirection: string;
    cuisine: string;
  }>();

  searchQuery: string = '';
  sortBy: string = 'date';
  sortDirection: string = 'desc';
  selectedCuisine: string = 'all';
  availableCuisines: { id: number; cuisine: string; }[] = [];
  errorMessage: string = '';

  constructor(private cuisineService: CuisineService) {}

  ngOnInit() {
    this.loadCuisines();
  }

  loadCuisines() {
    this.cuisineService.getCuisines().subscribe({
      next: (cuisines) => {
        this.availableCuisines = cuisines;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Error loading cuisines:', error);
      }
    });
  }

  applyFilters() {
    this.searchChange.emit({
      query: this.searchQuery,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      cuisine: this.selectedCuisine
    });
  }
} 