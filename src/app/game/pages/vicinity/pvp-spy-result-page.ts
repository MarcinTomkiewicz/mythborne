import { Component, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import {
  pvpSpyResultDisplay,
} from './pvp-spy-result-display';
import { PvpSpyResultState } from './pvp-spy-result.state';

@Component({
  selector: 'app-pvp-spy-result-page',
  standalone: true,
  imports: [ButtonModule, LoadingOverlay, RouterLink],
  providers: [PvpSpyResultState],
  templateUrl: './pvp-spy-result-page.html',
})
export class PvpSpyResultPage {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly page = inject(PvpSpyResultState);
  readonly display = computed(() => {
    const result = this.page.result();
    return result ? pvpSpyResultDisplay(result) : null;
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.page.load(params.get('spyResultId'));
      });
  }

  errorMessage(): string | null {
    const status = this.page.status();

    if (status === 'access-denied') {
      return 'You do not have access to this spy result.';
    }

    if (status === 'missing-or-not-accessible') {
      return 'This spy result was not found or is not accessible.';
    }

    return this.page.error();
  }
}
