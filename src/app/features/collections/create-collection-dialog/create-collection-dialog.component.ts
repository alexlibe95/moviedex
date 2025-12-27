import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface CreateCollectionDialogData {
  collectionName?: string;
}

@Component({
  selector: 'app-create-collection-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './create-collection-dialog.component.html',
  styleUrl: './create-collection-dialog.component.scss',
})
export class CreateCollectionDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CreateCollectionDialogComponent>);
  private readonly data = inject<CreateCollectionDialogData | null>(MAT_DIALOG_DATA);

  readonly collectionNameControl = new FormControl(this.data?.collectionName || '', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(100),
  ]);

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    if (this.collectionNameControl.valid) {
      const name = this.collectionNameControl.value?.trim();
      if (name) {
        this.dialogRef.close(name);
      }
    } else {
      this.collectionNameControl.markAsTouched();
    }
  }
}

