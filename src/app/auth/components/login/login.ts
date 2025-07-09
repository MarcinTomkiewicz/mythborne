import { Component, input, output, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './login.html',
})
export class Login {
  layout = input<'vertical' | 'horizontal'>('vertical');
  showHeader = input<boolean>(true);

  readonly login = output<{ email: string; password: string }>();

  private fb = new FormBuilder();
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly isHorizontal = computed(() => this.layout() === 'horizontal');

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;
    this.login.emit({ email: email!, password: password! });
  }
}
