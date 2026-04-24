import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { GeneratedItemResult } from '../../../core/domain/item/item-generation.model';
import { ItemGeneratorService } from '../../../core/services/items/item-generator';
import { BonusType } from '../../../core/types/bonus.types';
import { formatBonusValue } from '../../../core/utils/bonus';

@Component({
  selector: 'app-item-generator-panel',
  standalone: true,
  imports: [ButtonModule, InputTextModule],
  templateUrl: './item-generator-panel.html',
})
export class ItemGeneratorPanel {
  readonly luck = input(0);

  private readonly destroyRef = inject(DestroyRef);
  private readonly itemGenerator = inject(ItemGeneratorService);

  readonly generatedItem = signal<GeneratedItemResult | null>(null);
  readonly editableLuck = signal(0);
  readonly isGenerating = signal(false);
  readonly generationError = signal<string | null>(null);

  private readonly hasManualLuck = signal(false);

  constructor() {
    effect(() => {
      if (!this.hasManualLuck()) {
        this.editableLuck.set(this.clampLuck(this.luck()));
      }
    });
  }

  generateItem() {
    this.isGenerating.set(true);
    this.generationError.set(null);

    this.itemGenerator
      .generateItem(this.editableLuck())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isGenerating.set(false))
      )
      .subscribe({
        next: (item) => this.generatedItem.set(item),
        error: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Item generation failed while loading the catalog.';

          this.generatedItem.set(null);
          this.generationError.set(message);
        },
      });
  }

  updateLuck(value: string) {
    this.hasManualLuck.set(true);
    this.editableLuck.set(this.clampLuck(Number(value)));
  }

  resetLuck() {
    this.hasManualLuck.set(false);
    this.editableLuck.set(this.clampLuck(this.luck()));
  }

  toBonusValue(value: number, type: BonusType): string {
    return formatBonusValue(value, type);
  }

  private clampLuck(value: number): number {
    if (Number.isNaN(value)) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round(value)));
  }
}
