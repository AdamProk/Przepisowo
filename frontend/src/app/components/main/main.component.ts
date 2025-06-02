import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { RecipeRecommendationsComponent } from '../recipe-recommendations/recipe-recommendations.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, NavComponent, RecipeRecommendationsComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  // ... existing code ...
} 