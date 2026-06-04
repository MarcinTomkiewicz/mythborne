import { Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import type { SelectItem } from 'primeng/api';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-vicinity-pagination',
  standalone: true,
  imports: [
    PaginatorModule,
    ReactiveFormsModule,
    SelectModule,
  ],
  host: { class: 'd-contents' },
  templateUrl: './vicinity-pagination.html',
})
export class VicinityPagination {
  private readonly destroyRef = inject(DestroyRef);

  readonly pageLabel = input.required<string>();
  readonly rangeSummary = input.required<string>();
  readonly navigationLabel = input.required<string>();
  readonly placeholder = input.required<string>();
  readonly pageOptions = input.required<SelectItem<number>[]>();
  readonly first = input.required<number>();
  readonly totalRecords = input.required<number>();
  readonly pageChange = output<{ first?: number | null }>();
  readonly pageControl = new FormControl<number | null>(null);

  constructor() {
    effect(() => {
      const first = this.first();
      const value = this.pageOptions().some((option) => option.value === first)
        ? first
        : null;

      if (this.pageControl.value !== value) {
        this.pageControl.setValue(value, { emitEvent: false });
      }
    });

    this.pageControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((first) => {
        if (first !== null) {
          this.pageChange.emit({ first });
        }
      });
  }
}
