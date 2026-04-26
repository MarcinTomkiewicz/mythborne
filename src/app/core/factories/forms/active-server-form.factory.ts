import { Injectable, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { ActiveServerSelectorForm } from '../../types/forms/active-server-form.types';

@Injectable({ providedIn: 'root' })
export class ActiveServerFormFactory {
  private readonly fb = inject(NonNullableFormBuilder);

  createSelectorForm(): ActiveServerSelectorForm {
    return this.fb.group({
      selectedServerId: this.fb.control(''),
    });
  }
}
