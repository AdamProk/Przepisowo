import { Component,  ElementRef, ViewChild  } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { RecipesService } from '../services/recipes.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-addrecipe',
  standalone: true,
  imports: [RouterLink ,ReactiveFormsModule, CommonModule],
  templateUrl: './addrecipe.component.html',
  styleUrls: ['./addrecipe.component.css','../home/home.component.css']
})
export class AddrecipeComponent {
  @ViewChild('fileInput') fileInput?: ElementRef;
  addform: FormGroup;
  message: string = '';

  constructor(private fb: FormBuilder, private recipesService: RecipesService,private router: Router,private userService: UserService) {
    this.addform = this.fb.group({});
  }
  ngOnInit() {
    this.addform = this.fb.group({
      name: [''],
      date: [''],
      description: [''],
      ingredients: [''],
      amount: [''],
      time: [''],
    });
  }

  submitForm(event: Event){
    event.preventDefault();
    //const file = this.fileInput?.nativeElement.files[0];

    const formData = {
      name: this.addform.value.name,
      date:this.addform.value.date,
      description:this.addform.value.description,
      ingredients:this.addform.value.ingredients,
      amount:this.addform.value.amount,
      time:this.addform.value.time
    };
    
    console.log(formData);
    
    this.recipesService.addRecipe(formData).subscribe({
      next: response => {
          console.log('Added recipe successfully', response);
          this.message = "Added recipe successfuly";
      },
      error: error => {
          console.error('Error adding recipe:', error)
          this.message = "Something went wrong. Try again";
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
