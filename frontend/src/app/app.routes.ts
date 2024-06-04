import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { RecipeComponent } from './recipe/recipe.component';
import { AddrecipeComponent } from './addrecipe/addrecipe.component';

import { authGuard, loggedInAuthGuard } from './services/auth.guard';

export const routes: Routes = [
    {path:'', component: HomeComponent, canActivate: [authGuard]},
    {path:'login', component:LoginComponent, canActivate: [loggedInAuthGuard] },
    {path:'register', component:RegisterComponent, canActivate: [loggedInAuthGuard] },
    {path:'user', component:UserComponent, canActivate: [authGuard]},
    {path:'recipe/:id', component:RecipeComponent, canActivate: [authGuard]},
    {path:'addrecipe', component:AddrecipeComponent, canActivate: [authGuard]},
    { path: '**', redirectTo: '' }
];
