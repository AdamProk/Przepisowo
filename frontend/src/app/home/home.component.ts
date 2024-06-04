import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { RecipesService } from '../services/recipes.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  recipes:any;

  constructor(
    private recipesService: RecipesService,
    private userService: UserService,
    private router: Router,
) {}
 ngOnInit() {
    this.loadRecipes();
  }
goToRecipePage(recipeId: number) {
  this.router.navigate(['/recipe', recipeId]);
}
private loadRecipes() {
  this.recipesService.getRecipes().subscribe({
      next: data => {
          this.recipes = data;
      },
      error: error => {
          console.error('Error fetching recipe:', error);
      }
  });
}
public isUserLoggedIn(): boolean {
  return this.userService.isUserLoggedIn();
  
}

public isUserAdmin(): boolean {
  return this.userService.isUserAdmin();
}
logout(): void {
  localStorage.removeItem('authToken');
  this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
}

}
