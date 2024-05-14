import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AddrecipeComponent } from './addrecipe/addrecipe.component';
import { RecipeComponent } from './recipe/recipe.component';
import { UserComponent } from './user/user.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    RouterLink,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    AddrecipeComponent,
    RecipeComponent,
    UserComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
