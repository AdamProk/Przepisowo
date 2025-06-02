import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="navbar">
      <div class="nav-section nav-left">
        @if (loginService.isUserLoggedIn()) {
          <button class="profile-button">
            <a routerLink="/user">
              <img class="profile-button-img" [src]="getProfileImageUrl()" alt="User">
            </a>
          </button>
          <div class="nav-links">
            <a routerLink="/addrecipe" class="nav-link">Dodaj przepis</a>
            <a routerLink="/diet-plan" class="nav-link">Planer diety</a>
            <a routerLink="/scheduled-meals" class="nav-link">Zaplanowane posiłki</a>
          </div>
        }
      </div>
      <div class="nav-section nav-center">
        <button class="logo">
          <a routerLink="/">
            <img src="http://localhost:8000/img/logo.svg" alt="Logo">
          </a>
        </button>
      </div>
      <div class="nav-section nav-right">
        @if (loginService.isUserLoggedIn()) {
          <button type="submit" (click)="logout()" class="logout-button">Wyloguj</button>
        } @else {
          <div class="auth-links">
            <a routerLink="/login" class="nav-link">Zaloguj się / Zarejestruj się</a>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  constructor(
    public loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to user changes to refresh the component when needed
    this.loginService.currUser$.subscribe();
  }

  getProfileImageUrl(): string {
    const user = this.loginService.getCurrentUserSync();
    if (user?.profilePicture) {
      return `http://localhost:8000/uploads/profile_pictures/${user.profilePicture}`;
    }
    return 'http://localhost:8000/img/default/sample.png';
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
} 