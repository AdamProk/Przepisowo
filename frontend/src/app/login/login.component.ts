import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder,
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
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group(
        {
            email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
            password: [
            '',
            [
                Validators.required,
                Validators.minLength(4),
                Validators.maxLength(40),
            ],
            ],
        }
    );
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
            console.log('Zalogowano:', response)
            this.data = "Zalogowano. Twoje id: " + response.userId;
        },
        error: error => {
            console.error('Błąd podczas logowania:', error)
            this.data = error.message;
        }
    });

  }
}
