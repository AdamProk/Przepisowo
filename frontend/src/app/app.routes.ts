import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { RecipeComponent } from './recipe/recipe.component';
import { AddrecipeComponent } from './addrecipe/addrecipe.component';
import { DietPlanComponent } from './diet-plan/diet-plan.component';
import { ScheduledMealsComponent } from './scheduled-meals/scheduled-meals.component';

import { authGuard, loggedInAuthGuard } from './services/auth.guard';

export const routes: Routes = [
    {path:'', component: HomeComponent},
    {path:'login', component:LoginComponent, canActivate: [loggedInAuthGuard] },
    {path:'register', component:RegisterComponent, canActivate: [loggedInAuthGuard] },
    {path:'user', component:UserComponent, canActivate: [authGuard]},
    {path:'recipe/:id', component:RecipeComponent},
    {path:'addrecipe', component:AddrecipeComponent, canActivate: [authGuard]},
    {path:'diet-plan', component:DietPlanComponent, canActivate: [authGuard]},
    {path:'scheduled-meals', component:ScheduledMealsComponent, canActivate: [authGuard]},
    { path: '**', redirectTo: '' }
];
