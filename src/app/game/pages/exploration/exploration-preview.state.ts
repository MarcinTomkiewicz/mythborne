import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HeroExplorationDifficultyCardPreview } from '../../../core/domain/exploration/exploration-preview.model';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';

@Injectable()
export class ExplorationPreviewState {
  private readonly explorations = inject(HeroExplorations);

  readonly difficultyCardPreviews = signal<HeroExplorationDifficultyCardPreview[]>([]);
  readonly difficultyCardPreviewByKey = computed(() =>
    this.difficultyCardPreviews().reduce<
      Record<string, HeroExplorationDifficultyCardPreview>
    >((result, preview) => {
      result[preview.difficultyKey] = preview;
      return result;
    }, {}),
  );

  difficultyCardPreview(
    difficultyKey: string | null | undefined,
  ): HeroExplorationDifficultyCardPreview | null {
    return difficultyKey
      ? this.difficultyCardPreviewByKey()[difficultyKey] ?? null
      : null;
  }

  loadDifficultyCardPreviews(
    heroId: string,
  ): Observable<HeroExplorationDifficultyCardPreview[]> {
    return this.explorations.getHeroExplorationDifficultyCardPreviews({
      heroId,
      stepsToPreview: 3,
    });
  }
}
