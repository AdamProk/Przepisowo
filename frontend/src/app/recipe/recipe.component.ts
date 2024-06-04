import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import {  FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { RecipesService } from '../services/recipes.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsService } from '../services/comments.service';
@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css','../home/home.component.css']
})
export class RecipeComponent {
  recipe:any={}
  recipeId:number=0;
  reviewform:FormGroup;
  message:string='';
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private recipesService: RecipesService,
    private userService: UserService,
    private commentsService: CommentsService,
    private router: Router,
) {
  this.reviewform = this.fb.group({});}
  goBack() {
    this.router.navigate(['/']);
}
ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.recipeId = +params['id'];
    this.loadRecipe();
});
  this. reviewform = this.fb.group({
    rating_given: [''],
    recipe_id: this.recipeId,
    review_comment: [''],
  });
}
loadRecipe(): void{
  this.recipesService.getRecipe(this.recipeId).subscribe({
    next: data => {
        this.recipe= data;
    },
    error: error => {
        console.error('Error fetching recipe data:', error);
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

  submitForm(event: Event){
    event.preventDefault();

    const formData = {
      rating_given: this.reviewform.value.rating_given,
      comment: this.reviewform.value.comment,
      recipe_id: this.reviewform.value.recipe_id,
  }

    this.commentsService.commentRecipe(formData).subscribe({
      next: response => {
          console.log('Added comment successfully', response);
          this.message = "Added comment successfuly";
          window.location.reload();
      },
      error: error => {
          console.error('Error adding comment', error)
          this.message = "Something went wrong. Try again";
          window.location.reload();
      }
    });
  }
}
