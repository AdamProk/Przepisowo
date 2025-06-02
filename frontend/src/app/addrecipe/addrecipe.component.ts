import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecipesService } from '../services/recipes.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { CuisineService, Cuisine } from '../services/cuisine.service';
import { NavComponent } from '../components/nav/nav.component';
import { AVAILABLE_UNITS } from '../models/recipe.model';

@Component({
  selector: 'app-addrecipe',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, NavComponent],
  templateUrl: './addrecipe.component.html',
  styleUrls: ['./addrecipe.component.css','../home/home.component.css']
})
export class AddrecipeComponent implements OnInit {
  addform: FormGroup;
  message: string = 'Dodaj przepis';
  cuisines: Cuisine[] = [];
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  availableUnits = AVAILABLE_UNITS;

  constructor(private fb: FormBuilder, private recipesService: RecipesService, private router: Router, public userService: UserService, private cuisineService: CuisineService) {
    this.addform = this.fb.group({
      name: ['', Validators.required],
      ingredients: this.fb.array([]),
      preparationSteps: this.fb.array([]),
      time: ['', Validators.required],
      amount: ['', Validators.required],
      cuisines: [[]],
      calories: ['', Validators.required],
      proteins: [''],
      carbohydrates: [''],
      fats: [''],
      vitamins: [''],
      minerals: ['']
    });
  }

  ngOnInit() {
    this.addIngredient();
    this.addPreparationStep();
    this.loadCuisines();
  }

  // Ingredients methods
  get ingredients() {
    return this.addform.get('ingredients') as FormArray;
  }

  addIngredient() {
    const ingredientForm = this.fb.group({
      name: ['', Validators.required],
      quantity: ['', Validators.required],
      unit: ['g', Validators.required],
      optional: [false]
    });
    this.ingredients.push(ingredientForm);
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  // Preparation steps methods
  get preparationSteps() {
    return this.addform.get('preparationSteps') as FormArray;
  }

  addPreparationStep() {
    const stepForm = this.fb.group({
      order: [this.preparationSteps.length + 1],
      description: ['', Validators.required],
      time: [''],
      tip: ['']
    });
    this.preparationSteps.push(stepForm);
  }

  removePreparationStep(index: number) {
    this.preparationSteps.removeAt(index);
    // Update order of remaining steps
    this.preparationSteps.controls.forEach((control, idx) => {
      control.patchValue({ order: idx + 1 });
    });
  }

  moveStepUp(index: number) {
    if (index > 0) {
        const steps = this.preparationSteps;
        const currentStep = steps.at(index);
        const previousStep = steps.at(index - 1);
        const currentValue = currentStep.value;
        const previousValue = previousStep.value;
        
        // Swap the values while preserving the form controls
        currentStep.patchValue(previousValue);
        previousStep.patchValue(currentValue);
        
        // Update order numbers
        currentStep.patchValue({ order: index });
        previousStep.patchValue({ order: index + 1 });
    }
  }

  moveStepDown(index: number) {
    if (index < this.preparationSteps.length - 1) {
        const steps = this.preparationSteps;
        const currentStep = steps.at(index);
        const nextStep = steps.at(index + 1);
        const currentValue = currentStep.value;
        const nextValue = nextStep.value;
        
        // Swap the values while preserving the form controls
        currentStep.patchValue(nextValue);
        nextStep.patchValue(currentValue);
        
        // Update order numbers
        currentStep.patchValue({ order: index + 2 });
        nextStep.patchValue({ order: index + 1 });
    }
  }

  isUserLoggedIn(): boolean {
    return this.userService.isUserLoggedIn();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  loadCuisines() {
    this.cuisineService.getCuisines().subscribe({
      next: (cuisines) => {
        this.cuisines = cuisines;
      },
      error: (error) => {
        console.error('Error loading cuisines:', error);
      }
    });
  }

  submitForm(event: Event) {
    event.preventDefault();
    if (this.addform.valid) {
      const formData = new FormData();
      formData.append('name', this.addform.get('name')?.value);
      
      // Create description from preparation steps
      const steps = this.preparationSteps.value;
      const description = steps.map((step: any, index: number) => {
        let stepText = `${index + 1}. ${step.description}`;
        if (step.time) {
          stepText += ` (Czas: ${step.time} min)`;
        }
        if (step.tip) {
          stepText += `\nWskazówka: ${step.tip}`;
        }
        return stepText;
      }).join('\n\n');
      
      formData.append('description', description);
      formData.append('ingredients', JSON.stringify(this.ingredients.value));
      formData.append('preparationSteps', JSON.stringify(this.preparationSteps.value));
      formData.append('time', this.addform.get('time')?.value);
      formData.append('amount', this.addform.get('amount')?.value);
      formData.append('cuisines', JSON.stringify(this.addform.get('cuisines')?.value));
      
      // Nutrients
      const nutrients = {
        calories: this.addform.get('calories')?.value,
        proteins: this.addform.get('proteins')?.value,
        carbohydrates: this.addform.get('carbohydrates')?.value,
        fats: this.addform.get('fats')?.value,
        vitamins: this.addform.get('vitamins')?.value,
        minerals: this.addform.get('minerals')?.value
      };
      formData.append('nutrients', JSON.stringify(nutrients));

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.recipesService.addRecipe(formData).subscribe({
        next: (response: any) => {
          console.log('Recipe added successfully:', response);
          this.message = 'Przepis został dodany pomyślnie';
          this.router.navigate(['/recipes']);
        },
        error: (error) => {
          console.error('Error adding recipe:', error);
          this.message = 'Błąd podczas dodawania przepisu';
        }
      });
    } else {
      this.message = 'Proszę wypełnić wszystkie wymagane pola';
    }
  }
}
