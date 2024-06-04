import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, JsonPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, Router} from '@angular/router';
import { LoginService } from '../services/login.service';
import { UserService } from '../services/user.service';
import { RecipesService } from '../services/recipes.service';
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  profile: any;
  constructor(
    private recipesService: RecipesService,
    private userService: UserService,
    private loginService: LoginService,
    private router: Router,
  ) {}
  ngOnInit() {
    this.loadUserInfo();
  }
  private loadUserInfo() {
    this.loginService.getUser().subscribe({
        next: data => {
            this.profile = data;
        },
        error: error => {
            console.error('Error fetching user info:', error);
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
