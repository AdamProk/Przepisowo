import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-schedule-meal-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Zaplanuj posiłek</h2>
    <mat-dialog-content>
      <div class="dialog-content">
        <mat-form-field appearance="fill">
          <mat-label>Data</mat-label>
          <input matInput type="datetime-local" [(ngModel)]="scheduledDate">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Typ posiłku</mat-label>
          <mat-select [(ngModel)]="mealType">
            <mat-option value="breakfast">Śniadanie</mat-option>
            <mat-option value="lunch">Obiad</mat-option>
            <mat-option value="dinner">Kolacja</mat-option>
            <mat-option value="snack">Przekąska</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Liczba porcji</mat-label>
          <input matInput type="number" [(ngModel)]="portions" min="0.5" step="0.5">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Notatki</mat-label>
          <textarea matInput [(ngModel)]="notes"></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Anuluj</button>
      <button mat-button color="primary" (click)="onSchedule()">Zaplanuj</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 300px;
      padding: 16px 0;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class ScheduleMealDialogComponent {
  scheduledDate: string = '';
  mealType: string = '';
  portions: number = 1;
  notes: string = '';

  constructor(
    public dialogRef: MatDialogRef<ScheduleMealDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { recipe: Recipe }
  ) {
    // Set default date to current time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.scheduledDate = now.toISOString().slice(0, 16);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSchedule(): void {
    if (!this.scheduledDate || !this.mealType || this.portions <= 0) {
      return;
    }

    this.dialogRef.close({
      recipeId: this.data.recipe.id,
      scheduledDate: this.scheduledDate,
      mealType: this.mealType,
      portions: this.portions,
      notes: this.notes
    });
  }
} 