import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  layout = input<'vertical' | 'horizontal'>('vertical');
  showHeader = input<boolean>(true);
  readonly login = output<{ email: string; password: string }>();
  readonly errorMessage = signal<string | null>(null);

  private readonly fb = new FormBuilder();
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly isHorizontal = computed(() => this.layout() === 'horizontal');

  setError(message: string | null) {
    this.errorMessage.set(message);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);

    const { email, password } = this.form.value;
    this.login.emit({ email: email!, password: password! });
  }
}
