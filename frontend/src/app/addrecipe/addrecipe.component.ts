import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-addrecipe',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './addrecipe.component.html',
  styleUrls: ['./addrecipe.component.css','../home/home.component.css']
})
export class AddrecipeComponent {

}
