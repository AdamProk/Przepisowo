import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css','../home/home.component.css']
})
export class RecipeComponent {

}
