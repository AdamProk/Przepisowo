import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AddrecipeComponent } from './addrecipe/addrecipe.component';
import { RecipeComponent } from './recipe/recipe.component';
import { UserComponent } from './user/user.component';
import { UserService } from './services/user.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    RouterLink,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';

  constructor(
    private router: Router,
    private userService: UserService,
  ) {}


  redirectTo(page: string) {
      this.router.navigate(['/', page]);
  }

  public isUserLoggedIn(): boolean {
      return this.userService.isUserLoggedIn();
  }

  public isUserAdmin(): boolean {
      return this.userService.isUserAdmin();
  }
}
