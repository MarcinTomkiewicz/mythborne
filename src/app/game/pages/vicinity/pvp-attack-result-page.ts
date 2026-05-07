import { Component, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { pvpAttackResultDisplay } from './pvp-attack-result-display';
import { PvpAttackResultState } from './pvp-attack-result.state';

@Component({
  selector: 'app-pvp-attack-result-page',
  standalone: true,
  imports: [LoadingOverlay, RouterLink],
  providers: [PvpAttackResultState],
  templateUrl: './pvp-attack-result-page.html',
})
export class PvpAttackResultPage {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly page = inject(PvpAttackResultState);
  readonly display = computed(() => {
    const result = this.page.result();
    return result ? pvpAttackResultDisplay(result) : null;
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.page.load(params.get('attackResultId'));
      });
  }

  errorMessage(): string | null {
    const status = this.page.status();

    if (status === 'access-denied') {
      return 'You do not have access to this attack result.';
    }

    if (status === 'missing-or-not-accessible') {
      return 'This attack result was not found or is not accessible.';
    }

    return this.page.error();
  }
}
