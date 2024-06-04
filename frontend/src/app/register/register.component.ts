import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { LoginService } from '../services/login.service';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup = new FormGroup({
    username: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
  });
  submitted = false;
  data: string = "";

  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
  ) { }
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group(
        {
            username: [''],
            email: [''],
            password: [''],
            confirmPassword: [''],
        },
        
    );
  } 

  get form(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
}

  submitForm(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
        return;
    }

    const formData = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
    }

    console.log(JSON.stringify(this.registerForm.value, null, 2));
    console.log((formData));
    
    this.loginService.register(formData).subscribe({
        next: response => {
            console.log('Zarejestrowano:', response)
            this.data = "Zarejestrowano";
        },
        error: error => {
            console.error('Błąd podczas rejestracji:', error)
        }
    });

  }
}
