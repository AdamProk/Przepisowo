import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { UserService } from '../services/user.service';
import { RecipesService } from '../services/recipes.service';
import { Recipe } from '../models/recipe.model';
import { User, UserProfile } from '../models/user.model';
import { NavComponent } from '../components/nav/nav.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterLink, CommonModule, NavComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  profile: UserProfile | null = null;
  uploadMessage: string = '';
  uploadStatus: boolean = false;
  
  constructor(
    private recipesService: RecipesService,
    private userService: UserService,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.userService.isUserLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserProfile();
  }

  private loadUserProfile() {
    this.userService.getCurrentUser().subscribe({
      next: (data: User) => {
        console.log('User profile data:', data);
        // Convert User to UserProfile
        this.profile = {
          ...data,
          profilePicture: data.profilePicture || 'default.png',
          recipes: data.recipes || [],
          adminPrivileges: data.adminPrivileges || false,
          totalRecipes: data.recipes?.length || 0,
          averageRating: this.calculateAverageRating(data.recipes || [])
        };
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  private calculateAverageRating(recipes: Recipe[]): number {
    if (!recipes.length) return 0;
    const sum = recipes.reduce((acc, recipe) => acc + (recipe.rating || 0), 0);
    return sum / recipes.length;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const formData = new FormData();
      formData.append('image', input.files[0]);

      this.userService.updateProfilePicture(formData).subscribe({
        next: (response) => {
          this.uploadMessage = 'Profile picture updated successfully';
          this.uploadStatus = true;
          this.loadUserProfile();
        },
        error: (error) => {
          this.uploadMessage = 'Failed to update profile picture';
          this.uploadStatus = false;
          console.error('Error updating profile picture:', error);
        }
      });
    }
  }

  getProfileImageUrl(): string {
    if (this.profile?.profilePicture) {
      return this.userService.getProfileImageUrl(this.profile.profilePicture);
    }
    return this.userService.getProfileImageUrl();
  }

  getRecipeImageUrl(recipe: Recipe): string {
    if (recipe.recipePicture && recipe.recipePicture !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${recipe.recipePicture}`;
    } else if (recipe.image && recipe.image !== 'kotlet.jpg') {
      return `http://localhost:8000/uploads/recipe_images/${recipe.image}`;
    }
    return 'http://localhost:8000/img/kotlet.jpg';
  }

  isUserLoggedIn(): boolean {
    return this.userService.isUserLoggedIn();
  }

  isUserAdmin(): boolean {
    return this.userService.isUserAdmin();
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  goToRecipePage(recipeId: number) {
    this.router.navigate(['/recipe', recipeId]);
  }
}
