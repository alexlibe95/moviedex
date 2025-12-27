import { Directive, HostListener, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appAlphanumericMinLength]'
})
export class AlphanumericMinLengthDirective {
  readonly minLength = input(3);
  private readonly control = inject(NgControl, { optional: true, self: true });

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove non-alphanumeric characters but allow spaces (for movie titles like "Star Wars")
    value = value.replace(/[^a-zA-Z0-9 ]/g, '');

    // Update the input value
    if (input.value !== value) {
      input.value = value;
      // Update the form control value if available
      if (this.control?.control) {
        this.control.control.setValue(value, { emitEvent: true });
      }
    }

    // Validate minimum length on input
    this.validateMinLength(value);
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    
    // Mark as touched to show errors
    if (this.control?.control) {
      this.control.control.markAsTouched();
    }
    
    this.validateMinLength(value);
  }

  private validateMinLength(value: string): void {
    const trimmedValue = value.trim();
    
    if (this.control?.control) {
      if (trimmedValue.length > 0 && trimmedValue.length < this.minLength()) {
        const currentErrors = this.control.control.errors || {};
        this.control.control.setErrors({
          ...currentErrors,
          minLength: {
            requiredLength: this.minLength(),
            actualLength: trimmedValue.length,
          },
        });
      } else {
        // Clear minLength error if valid
        const errors = { ...this.control.control.errors };
        if (errors['minLength']) {
          delete errors['minLength'];
          this.control.control.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
      }
    }
  }
}

