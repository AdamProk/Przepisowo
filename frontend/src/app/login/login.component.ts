import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../services/login.service';

interface LoginResponse {
  token: string;
  error?: {
    message: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  message: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submitForm(event: Event) {
    event.preventDefault();
    if (this.loginForm.valid) {
      this.message = '';
      this.loginService.login(this.loginForm.value).subscribe({
        next: (response: LoginResponse) => {
          if (response.token) {
            this.message = 'Login successful!';
            this.router.navigate(['/']);
          } else {
            this.message = 'Login failed: Invalid response from server';
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.message = error.error?.message || 'Login failed. Please check your credentials.';
        }
      });
    } else {
      this.message = 'Please fill in all required fields correctly.';
    }
  }
}
