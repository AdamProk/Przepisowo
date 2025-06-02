import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { RecipesService } from '../services/recipes.service';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';
import { Recipe } from '../models/recipe.model';
import { LoginService } from '../services/login.service';
import { NavComponent } from '../components/nav/nav.component';
import { RecipeRecommendationsComponent } from '../components/recipe-recommendations/recipe-recommendations.component';
import { RecipeSearchComponent } from '../components/recipe-search/recipe-search.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink, 
    CommonModule, 
    FormsModule, 
    NavComponent, 
    RecipeRecommendationsComponent,
    RecipeSearchComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  recipes: Recipe[] = [];
  allRecipes: Recipe[] = [];

  constructor(
    public userService: UserService,
    private router: Router,
    private recipesService: RecipesService,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.loadRecipes();
  }

  loadRecipes() {
    this.recipesService.getRecipes().subscribe({
      next: (recipes) => {
        this.allRecipes = recipes;
        this.recipes = [...recipes];
      },
      error: (error) => {
        console.error('Error loading recipes:', error);
      }
    });
  }

  handleSearchChange(event: { query: string; sortBy: string; sortDirection: string; cuisine: string; }) {
    let filtered = [...this.allRecipes];

    // Apply search filter
    if (event.query?.trim()) {
      const query = event.query.toLowerCase();
      filtered = filtered.filter(recipe => {
        const recipeName = recipe.recipeName?.toLowerCase() || '';
        const name = recipe.name?.toLowerCase() || '';
        return recipeName.includes(query) || name.includes(query);
      });
    }

    // Apply cuisine filter
    if (event.cuisine !== 'all') {
      filtered = filtered.filter(recipe => {
        if (!recipe.cuisines || recipe.cuisines.length === 0) {
          return event.cuisine === 'inna';
        }
        return recipe.cuisines.some(cuisine => 
          cuisine.cuisine?.toLowerCase() === event.cuisine.toLowerCase()
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (event.sortBy) {
        case 'date':
          valueA = a.id || 0;
          valueB = b.id || 0;
          break;
        case 'rating':
          valueA = a.score || a.rating || 0;
          valueB = b.score || b.rating || 0;
          break;
        case 'comments':
          valueA = a.comments_count || 0;
          valueB = b.comments_count || 0;
          break;
        case 'diet_plan':
          valueA = a.diet_plan_count || 0;
          valueB = b.diet_plan_count || 0;
          break;
        default:
          valueA = a.recipeName || a.name || '';
          valueB = b.recipeName || b.name || '';
      }

      const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return event.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.recipes = filtered;
  }

  getRecipeImageUrl(recipe: Recipe): string {
    if (recipe.recipePicture && recipe.recipePicture !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${recipe.recipePicture}`;
    } else if (recipe.image && recipe.image !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${recipe.image}`;
    }
    return 'http://localhost:8000/img/kotlet.jpg';
  }

  getRecipeCuisines(recipe: Recipe): string {
    if (recipe.cuisines && Array.isArray(recipe.cuisines)) {
      return recipe.cuisines.map(c => c.cuisine).join(', ');
    }
    return 'Brak informacji';
  }

  goToRecipePage(id: number) {
    this.router.navigate(['/recipe', id]);
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  isUserLoggedIn(): boolean {
    return this.loginService.isUserLoggedIn();
  }
}
