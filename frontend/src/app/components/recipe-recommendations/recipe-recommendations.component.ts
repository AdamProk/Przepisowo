import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { RecipeRecommendationsService, RecipeRecommendation } from '../../services/recipe-recommendations.service';
import { interval, Subscription, BehaviorSubject } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-recipe-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="recommendations-section">
      @if (isAuthenticated()) {
        <div class="recommendations-header">
          <h2>Rekomendowane dla Ciebie</h2>
          <button class="click-button" [disabled]="isLoading()" (click)="refreshRecommendations()">
            {{ isLoading() ? 'Odświeżanie...' : 'Odśwież rekomendacje' }}
          </button>
        </div>
        @defer {
          @if (error()) {
            <div class="error-message">{{error()}}</div>
          } @else if (isLoading()) {
            <div class="loading-message">Ładowanie rekomendacji...</div>
          } @else if (recommendations().length === 0) {
            <div class="no-recommendations">
              <p>Zaplanuj posiłek abyśmy mogli ci coś polecić</p>
            </div>
          } @else {
            <div class="recommendations-row">
              @for (recommendation of topRecommendations(); track recommendation.recipe.id) {
                <div class="recommendation-card">
                  <img class="recipe-image" [src]="getRecipeImageUrl(recommendation.recipe)" [alt]="recommendation.recipe.name">
                  <div class="recipe-content">
                    <div class="recipe-info">
                      <h3>{{recommendation.recipe.name}}</h3>
                      <div class="recipe-details">
                        <div class="time-portions">
                          <span>Czas: {{recommendation.recipe.prepTime}} min</span>
                          <span>Porcje: {{recommendation.recipe.amount}}</span>
                        </div>
                      </div>
                      <p class="match-reason">{{recommendation.reason}}</p>
                      <div class="match-bar">
                        <div class="match-fill" [style.width.%]="recommendation.matchScore * 100"></div>
                        <span class="match-text">{{(recommendation.matchScore * 100).toFixed(0)}}% dopasowania</span>
                      </div>
                    </div>
                    <button class="recipe-button" [routerLink]="['/recipe', recommendation.recipe.id]">
                      Zobacz przepis
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        } @loading {
          <div class="loading-message">Ładowanie rekomendacji...</div>
        }
      }
    </div>
  `,
  styles: [`
    .recommendations-section {
      padding: 20px;
      margin: 20px;
    }

    .recommendations-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .click-button {
      background: #05c435;
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
      border-radius: 0.5em;
      height: 2em;
      width: 12em;
      border: none;
      color: white;
      margin: 0.5em;
      line-height: 2em;
      font-size: 1em;
    }

    .click-button:hover {
      font-weight: bold;
    }

    .click-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      color: black;
    }

    .recommendations-row {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      padding: 0 10px;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .recommendations-row::-webkit-scrollbar {
      display: none;
    }

    .error-message {
      width: 100%;
      text-align: center;
      color: #721c24;
      padding: 10px;
      font-size: 16px;
    }

    .loading-message {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 16px;
    }

    .recommendation-card {
      flex: 0 0 auto;
      width: 300px;
      background-color: #55FFA3;
      border: 1px solid black;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .recipe-image {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
    }

    .recipe-content {
      padding: 15px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      justify-content: space-between;
    }

    .recipe-info {
      flex-grow: 1;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      color: black;
      text-align: center;
    }

    .time-portions {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      font-size: 14px;
    }

    .match-reason {
      margin: 10px 0;
      font-size: 14px;
      color: black;
      text-align: center;
      min-height: 2.8em;
    }

    .match-bar {
      height: 24px;
      background-color: white;
      border: 1px solid black;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
      margin: 10px 0;
    }

    .match-fill {
      height: 100%;
      background-color: #39F383;
      transition: width 0.3s ease;
    }

    .match-text {
      position: absolute;
      width: 100%;
      text-align: center;
      line-height: 24px;
      color: black;
      font-size: 14px;
      z-index: 1;
    }

    .recipe-button {
      background: #05c435;
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25), 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
      border-radius: 0.5em;
      height: 2em;
      width: 8em;
      border: none;
      color: white;
      margin: 0.5em auto;
      line-height: 2em;
      font-size: 1em;
      display: block;
      text-align: center;
    }

    .recipe-button:hover {
      font-weight: bold;
    }

    .no-recommendations {
      text-align: center;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      margin: 20px 0;
    }

    .no-recommendations p {
      margin: 0;
      font-size: 16px;
      color: #6c757d;
    }
  `]
})
export class RecipeRecommendationsComponent implements OnInit, OnDestroy {
  private refreshSubscription?: Subscription;
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  // Signals for reactive state management
  recommendations = signal<RecipeRecommendation[]>([]);
  error = signal<string | null>(null);
  isLoading = signal(false);

  // Computed signal for top recommendations
  topRecommendations = computed(() => {
    return this.recommendations()
      .sort((a, b) => {
        // First sort by match score
        const matchScoreDiff = b.matchScore - a.matchScore;
        if (matchScoreDiff !== 0) return matchScoreDiff;
        
        // If match scores are equal, sort by recipe rating
        return (b.recipe.rating || 0) - (a.recipe.rating || 0);
      })
      .slice(0, 3); // Take only top 3
  });

  constructor(
    private recommendationsService: RecipeRecommendationsService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Defer initial load to help with hydration
    setTimeout(() => {
      if (this.isAuthenticated()) {
        this.loadRecommendations();
        // Refresh recommendations every 1 minute
        this.refreshSubscription = interval(60000).subscribe(() => {
          if (this.isAuthenticated()) {
            this.loadRecommendations();
          }
        });
      }
    }, 0);
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    this.refreshSubject.complete();
  }

  public refreshRecommendations() {
    if (this.isAuthenticated() && !this.isLoading()) {
      this.refreshSubject.next();
      this.loadRecommendations();
    }
  }

  isAuthenticated(): boolean {
    return this.userService.isUserLoggedIn();
  }

  loadRecommendations() {
    if (!this.isAuthenticated()) {
      return;
    }
    
    this.isLoading.set(true);
    this.error.set(null);
    
    this.recommendationsService.getPersonalizedRecommendations()
      .subscribe({
        next: (recommendations) => {
          this.recommendations.set(recommendations);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading recommendations:', error);
          this.error.set('Nie udało się załadować rekomendacji. Spróbuj ponownie później.');
          this.isLoading.set(false);
        }
      });
  }

  getRecipeImageUrl(recipe: any): string {
    // First check if we have a valid image path
    if (recipe.picture && recipe.picture !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${recipe.picture}`;
    } else if (recipe.recipePicture && recipe.recipePicture !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${recipe.recipePicture}`;
    } else if (recipe.image && recipe.image !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${recipe.image}`;
    }
    
    // If no valid image is found, return the default image
    return 'http://localhost:8000/img/kotlet.jpg';
  }
} 