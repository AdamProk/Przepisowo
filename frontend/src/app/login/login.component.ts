import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder,
  AbstractControl,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { LoginService } from '../services/login.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });
  submitted = false;
  data: string = "";

  constructor(
      private loginService: LoginService,
      private formBuilder: FormBuilder,
      private router: Router,
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group(
        {
            email: [''],
            password: [''],
        }
    );
  }
  get form(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
}

  submitForm(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
        return;
    }

    const formData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
    }

    console.log(JSON.stringify(this.loginForm.value, null, 2));
    console.log((formData));
    
    this.loginService.login(formData).subscribe({
        next: response => {
            localStorage.setItem('authToken', response.token);
            // this.userService.notifyUserLoggedIn();
            this.router.navigate(['/']);
        },
        error: error => {
            console.error('Błąd podczas logowania:', error)
            this.data = error.message;
        }
    });

  }
}
