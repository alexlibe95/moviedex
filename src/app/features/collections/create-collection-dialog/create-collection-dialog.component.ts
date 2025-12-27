import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface CreateCollectionDialogData {
  collectionName?: string;
  collectionDescription?: string;
}

export interface CreateCollectionResult {
  name: string;
  description?: string;
}

@Component({
  selector: 'app-create-collection-dialog',
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

  readonly collectionDescriptionControl = new FormControl(
    this.data?.collectionDescription || '',
    [Validators.maxLength(500)]
  );

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    if (this.collectionNameControl.valid) {
      const name = this.collectionNameControl.value?.trim();
      if (name) {
        const description = this.collectionDescriptionControl.value?.trim() || undefined;
        const result: CreateCollectionResult = {
          name,
          description,
        };
        this.dialogRef.close(result);
      }
    } else {
      this.collectionNameControl.markAsTouched();
      this.collectionDescriptionControl.markAsTouched();
    }
  }
}

