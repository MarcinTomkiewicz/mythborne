import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { ExplorationDifficultyTierReadModel } from '../../../core/domain/exploration/exploration-definition.model';
import { TrialOpportunityCurvePreview } from '../../../core/domain/exploration/exploration-preview.model';
import { HeroExplorations } from '../../../core/services/exploration/hero-explorations';

@Injectable()
export class ExplorationPreviewState {
  private readonly explorations = inject(HeroExplorations);

  readonly previewByDifficulty = signal<Record<string, TrialOpportunityCurvePreview[]>>({});

  previewRows(difficultyKey: string): TrialOpportunityCurvePreview[] {
    return this.previewByDifficulty()[difficultyKey] ?? [];
  }

  loadPreviews(
    difficulties: readonly ExplorationDifficultyTierReadModel[],
  ): Observable<Record<string, TrialOpportunityCurvePreview[]>> {
    const entries = difficulties.map((difficulty) =>
      this.explorations
        .previewTrialOpportunityCurve({
          difficultyKey: difficulty.key,
          stepsToPreview: 3,
        })
        .pipe(map((preview) => [difficulty.key, preview] as const)),
    );

    if (!entries.length) {
      return of({});
    }

    return forkJoin(entries).pipe(
      map((items) =>
        items.reduce<Record<string, TrialOpportunityCurvePreview[]>>(
          (result, [difficultyKey, preview]) => {
            result[difficultyKey] = preview;
            return result;
          },
          {},
        ),
      ),
    );
  }
}
