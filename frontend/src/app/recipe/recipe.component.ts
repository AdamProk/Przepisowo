import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { RecipesService } from '../services/recipes.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsService } from '../services/comments.service';
import { NavComponent } from '../components/nav/nav.component';
import { Cuisine } from '../models/cuisine.model';
import { Recipe } from '../models/recipe.model';
import { DietPlanService } from '../services/diet-plan.service';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, NavComponent, FormsModule],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css','../home/home.component.css'],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: rgb(183, 255, 217);
    }

    .container {
      width: 80%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      box-sizing: border-box;
    }

    .recipe-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .recipe-header h1 {
      font-size: 2.5em;
      color: #333;
      margin-bottom: 10px;
    }

    .recipe-image {
      width: 100%;
      max-width: 800px;
      margin: 0 auto 30px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .recipe-image img {
      width: 100%;
      height: auto;
      display: block;
    }

    .recipe-details {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .recipe-info {
      text-align: center;
      flex: 1;
      min-width: 200px;
    }

    .recipe-info h3 {
      color: #666;
      margin-bottom: 5px;
      font-size: 1.1em;
    }

    .recipe-info p {
      color: #333;
      font-size: 1.2em;
      font-weight: 500;
      margin: 0;
    }

    .recipe-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }

    .ingredients,
    .instructions {
      background-color: #55FFA3;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .ingredients h2,
    .instructions h2 {
      color: #333;
      margin-bottom: 20px;
      font-size: 1.5em;
      text-align: center;
    }

    .ingredients ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    .ingredients li {
      padding: 10px;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      color: #444;
      font-size: 1.1em;
    }

    .ingredients li:last-child {
      border-bottom: none;
    }

    .instructions ol {
      padding-left: 20px;
      margin: 0;
    }

    .instructions li {
      margin-bottom: 15px;
      color: #444;
      font-size: 1.1em;
      line-height: 1.5;
    }

    .instructions li:last-child {
      margin-bottom: 0;
    }

    .nutrition-section {
      margin-bottom: 40px;
    }

    .nutrition-section h2 {
      text-align: center;
      color: #333;
      margin-bottom: 20px;
      font-size: 1.5em;
    }

    .nutrition-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      background-color: #55FFA3;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .nutrition-item {
      text-align: center;
      padding: 15px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
    }

    .nutrition-item h3 {
      color: #666;
      margin-bottom: 5px;
      font-size: 1.1em;
    }

    .nutrition-item p {
      color: #333;
      font-size: 1.2em;
      font-weight: 500;
      margin: 0;
    }

    .comments-section {
      margin-bottom: 40px;
    }

    .comments-section h2 {
      text-align: center;
      color: #333;
      margin-bottom: 20px;
      font-size: 1.5em;
    }

    .comment-form {
      background-color: #55FFA3;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .comment-form textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
      min-height: 100px;
      margin-bottom: 10px;
      font-size: 1em;
    }

    .comment-form button {
      background-color: #39F383;
      color: black;
      border: 1px solid black;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.2s;
    }

    .comment-form button:hover {
      background-color: #2dd36f;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .comment {
      background-color: #55FFA3;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .comment-author {
      font-weight: 500;
      color: #333;
    }

    .comment-date {
      color: #666;
      font-size: 0.9em;
    }

    .comment-content {
      color: #444;
      line-height: 1.5;
    }

    .no-comments {
      text-align: center;
      color: #666;
      font-size: 1.2em;
      margin-top: 20px;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 40px;
    }

    .action-btn {
      background-color: #39F383;
      color: black;
      border: 1px solid black;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.2s;
    }

    .action-btn:hover {
      background-color: #2dd36f;
    }

    .action-btn.delete {
      background-color: #dc3545;
      color: white;
      border: none;
    }

    .action-btn.delete:hover {
      background-color: #c82333;
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
    }

    .dialog h2 {
      margin: 0 0 20px 0;
      font-size: 1.5em;
      color: #333;
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
      color: #333;
    }

    .form-group input,
    .form-group select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
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
      border: none;
    }

    .cancel-btn {
      background-color: #f5f5f5;
      color: #333;
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

    .recipe {
      width: 100%;
      margin: 0 auto;
      background-color: #55FFA3;
      border: 1px solid black;
      border-radius: 8px;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      box-sizing: border-box;
    }

    .recipe_left {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    .recipe_img {
      width: 100%;
      height: 300px;
      border-radius: 4px;
      border: 1px solid black;
      overflow: hidden;
    }

    .recipe_right {
      width: 100%;
      padding: 10px;
    }

    .recipe_top {
      text-align: center;
      margin-bottom: 15px;
    }

    .recipe_top h1 {
      margin: 0;
      font-size: 24px;
      color: black;
    }

    .recipe_bottom {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .recipe_info {
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
      text-align: center;
      font-size: 14px;
      color: black;
    }

    .recipe_stat_item p {
      margin: 0;
    }

    .nutrients-section {
      margin: 15px 0;
    }

    .nutrients-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 10px;
    }

    .nutrients-grid-secondary {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .nutrient-item {
      background-color: #39F383;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid black;
      text-align: center;
    }

    .nutrient-label {
      font-weight: bold;
      color: black;
      font-size: 12px;
    }

    .nutrient-value {
      color: black;
      font-size: 12px;
    }

    .recipe_info_section {
      width: 100%;
      margin: 20px auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      background-color: #55FFA3;
      border: 1px solid black;
      border-radius: 8px;
      box-sizing: border-box;
    }

    .recipe_desc, .recipe_ing, .comments {
      width: 100%;
      margin: 20px auto;
      box-sizing: border-box;
    }

    .cuisine_info {
      padding: 10px;
    }

    .cuisine_info h2, .nutrients_info h2 {
      margin: 0 0 10px 0;
      font-size: 20px;
      color: black;
    }

    .nutrients_info {
      padding: 10px;
    }
  `]
})
export class RecipeComponent implements OnInit {
  recipe: Recipe | null = null;
  recipeId: number = 0;
  reviewform: FormGroup;
  message: string = '';
  uploadMessage: string = '';
  uploadStatus: boolean = false;
  newComment = {
    content: '',
    rating: 0
  };
  currentServings: number = 1;
  originalServings: number = 1;
  activeTimers: Map<number, any> = new Map();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private recipesService: RecipesService,
    private userService: UserService,
    private commentsService: CommentsService,
    private router: Router,
    private dietPlanService: DietPlanService,
    private loginService: LoginService
  ) {
    this.reviewform = this.fb.group({
      rating_given: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      review_comment: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.recipeId = +params['id'];
      this.loadRecipe();
    });
  }

  loadRecipe(): void {
    this.recipesService.getRecipe(this.recipeId).subscribe({
      next: (data: Recipe) => {
        this.recipe = data;
        this.currentServings = data.amount || 1;
        this.originalServings = data.amount || 1;

        // Parse ingredients if they're in string format
        if (typeof data.ingredients === 'string') {
          try {
            this.recipe.ingredients = JSON.parse(data.ingredients as string);
          } catch (e) {
            console.error('Error parsing ingredients:', e);
            this.recipe.ingredients = [];
          }
        }

        // Parse preparation steps if they're in string format
        if (typeof data.preparationSteps === 'string') {
          try {
            this.recipe.preparationSteps = JSON.parse(data.preparationSteps as string);
          } catch (e) {
            console.error('Error parsing preparation steps:', e);
            this.recipe.preparationSteps = [];
          }
        }

        // If there are no structured preparation steps but there is a description,
        // try to convert it to steps
        if ((!this.recipe.preparationSteps || this.recipe.preparationSteps.length === 0) && this.recipe.description) {
          const steps = this.recipe.description.split('\n').filter(step => step.trim());
          this.recipe.preparationSteps = steps.map((step, index) => ({
            order: index + 1,
            description: step.trim(),
            time: undefined,
            tip: undefined
          }));
        }
      },
      error: error => {
        console.error('Error fetching recipe data:', error);
      }
    });
  }

  submitForm(event: Event): void {
    event.preventDefault();
    if (this.reviewform.valid) {
      const formData = {
        rating_given: this.reviewform.value.rating_given,
        comment: this.reviewform.value.review_comment,
        recipe_id: this.recipeId
      };

      this.commentsService.commentRecipe(formData).subscribe({
        next: response => {
          console.log('Added comment successfully', response);
          this.message = "Added comment successfully";
          this.reviewform.reset();
          this.loadRecipe();
        },
        error: error => {
          console.error('Error adding comment', error);
          this.message = "Something went wrong. Try again";
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  public isUserLoggedIn(): boolean {
    return this.userService.isUserLoggedIn();
  }
  
  public isUserAdmin(): boolean {
    return this.userService.isUserAdmin();
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  getCommentUserProfilePicture(comment: any): string {
    if (comment.user?.profilePicture) {
      return `http://localhost:8000/uploads/profile_pictures/${comment.user.profilePicture}`;
    }
    return 'http://localhost:8000/uploads/default/sample.svg';
  }

  onSubmit() {
    if (!this.recipe?.id) return;

    this.recipesService.addComment(this.recipe.id, this.newComment).subscribe({
      next: (response) => {
        this.loadRecipe();
        this.newComment = {
          content: '',
          rating: 0
        };
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      }
    });
  }

  getCuisineNames(): string {
    const cuisines = this.recipe?.cuisines || [];
    return cuisines.length > 0 
        ? cuisines.map((cuisine: Cuisine) => cuisine.cuisine).join(', ')
        : 'Nie określono';
  }

  addToDietPlan(): void {
    if (!this.isUserLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.recipe) return;

    this.dietPlanService.addToDietPlan(this.recipe.id).subscribe({
      next: () => {
        // Show success message or handle success case
        console.log('Recipe added to diet plan successfully');
      },
      error: (error) => {
        console.error('Error adding recipe to diet plan:', error);
      }
    });
  }

  getRecipeImageUrl(): string {
    if (this.recipe?.recipePicture && this.recipe.recipePicture !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${this.recipe.recipePicture}`;
    } else if (this.recipe?.image && this.recipe.image !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${this.recipe.image}`;
    }
    return 'http://localhost:8000/img/kotlet.jpg';
  }

  isRecipeCreator(): boolean {
    if (!this.recipe || !this.recipe.user) return false;
    const currentUser = this.userService.getCurrentUserSync();
    return currentUser?.id === this.recipe.user.id;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const formData = new FormData();
      formData.append('image', input.files[0]);

      this.recipesService.updateRecipeImage(this.recipeId, formData).subscribe({
        next: (response) => {
          this.uploadMessage = 'Recipe picture updated successfully';
          this.uploadStatus = true;
          this.loadRecipe();
        },
        error: (error) => {
          this.uploadMessage = 'Failed to update recipe picture';
          this.uploadStatus = false;
          console.error('Error updating recipe picture:', error);
        }
      });
    }
  }

  adjustServings(change: number) {
    const newServings = this.currentServings + change;
    if (newServings >= 1) {
      this.currentServings = newServings;
    }
  }

  scaleAmount(amount: number, currentServings: number): number {
    const scaleFactor = currentServings / this.originalServings;
    return Math.round((amount * scaleFactor) * 10) / 10;
  }

  startTimer(minutes: number) {
    const stepId = Math.random(); // Generate a unique ID for this timer
    let seconds = minutes * 60;
    
    // Create notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      // Timer already exists
      if (this.activeTimers.has(stepId)) {
        return;
      }

      const timer = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
          clearInterval(timer);
          this.activeTimers.delete(stepId);
          
          new Notification('Timer zakończony!', {
            body: `Upłynęło ${minutes} minut`,
            icon: '/assets/timer-icon.png'
          });
        }
      }, 1000);

      this.activeTimers.set(stepId, timer);
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.startTimer(minutes); // Try again after permission is granted
        }
      });
    }
  }

  ngOnDestroy() {
    // Clear any active timers when component is destroyed
    this.activeTimers.forEach(timer => clearInterval(timer));
    this.activeTimers.clear();
  }

  // Helper methods for template type checking
  isStringIngredient(ingredient: any): boolean {
    return typeof ingredient === 'string';
  }

  isStringStep(step: any): boolean {
    return typeof step === 'string';
  }

  formatIngredient(ingredient: any): string {
    if (typeof ingredient === 'string') {
      return ingredient;
    }
    const amount = this.scaleAmount(ingredient.quantity || 0, this.currentServings);
    return `${amount} ${ingredient.unit || ''} ${ingredient.name || ''}`.trim();
  }
}
