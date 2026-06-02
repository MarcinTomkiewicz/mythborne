import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InplaceModule } from 'primeng/inplace';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-inline-text-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InplaceModule,
    InputTextModule,
  ],
  templateUrl: './inline-text-edit.html',
})
export class InlineTextEdit {
  readonly control = input.required<FormControl<string>>();
  readonly originalValue = input.required<string>();
  readonly displayLabel = input.required<string>();
  readonly submitAriaLabel = input.required<string>();
  readonly cancelAriaLabel = input.required<string>();
  readonly disabled = input(false);
  readonly submitted = output<string>();

  actionIsCancel(): boolean {
    const value = this.trimmedValue();

    return (
      this.control().pristine
      || value.length === 0
      || value === this.originalValue()
    );
  }

  actionIcon(): string {
    return this.actionIsCancel()
      ? 'pi pi-interdiction'
      : 'pi pi-scroll-quill';
  }

  actionSeverity(): 'danger' | 'secondary' {
    return this.actionIsCancel() ? 'danger' : 'secondary';
  }

  actionAriaLabel(): string {
    return this.actionIsCancel()
      ? this.cancelAriaLabel()
      : this.submitAriaLabel();
  }

  handleAction(closeCallback: (event?: Event) => void, event: Event): void {
    if (this.actionIsCancel()) {
      this.resetControl();
      closeCallback(event);
      return;
    }

    this.submitted.emit(this.trimmedValue());
    this.control().markAsPristine();
    closeCallback(event);
  }

  private resetControl(): void {
    const control = this.control();

    control.setValue(this.originalValue(), { emitEvent: false });
    control.markAsPristine();
  }

  private trimmedValue(): string {
    return this.control().value.trim();
  }
}
