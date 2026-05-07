import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormulaAdminData } from '../../../core/domain/formula/formula.model';
import {
  EMPTY_FORMULA_ADMIN_DATA,
  FormulaTargetAssignmentRow,
} from '../../../core/types/formula-admin-view.types';
import {
  PvpTravelTimingAdmin,
  PVP_TRAVEL_TIMING_FORMULA_TARGET_KEYS,
} from '../../../core/services/pvp/pvp-travel-timing-admin';
import { getErrorMessage } from '../../../core/utils/error-message';
import {
  formulaTargetContextPreview,
  missingFormulaTargetKeys,
  toFormulaTargetAssignmentRows,
} from '../../../core/utils/formula-target-assignment-rows';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { PVP_TRAVEL_TIMING_PAGE_LINKS } from '../../admin-navigation.config';
import { AdminSectionIntro } from '../../components/admin-section-intro/admin-section-intro';
import { AdminTagLinks } from '../../components/admin-tag-links/admin-tag-links';

@Component({
  selector: 'app-pvp-travel-timing-page',
  standalone: true,
  imports: [AdminSectionIntro, AdminTagLinks, LoadingOverlay],
  templateUrl: './pvp-travel-timing-page.html',
})
export class PvpTravelTimingPage implements OnInit {
  private readonly travelTiming = inject(PvpTravelTimingAdmin);
  private readonly destroyRef = inject(DestroyRef);

  readonly links = PVP_TRAVEL_TIMING_PAGE_LINKS;
  readonly data = signal<FormulaAdminData>(EMPTY_FORMULA_ADMIN_DATA);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly formulaRows = computed(() =>
    toFormulaTargetAssignmentRows(
      this.data(),
      PVP_TRAVEL_TIMING_FORMULA_TARGET_KEYS,
    ),
  );
  readonly missingFormulaTargetKeys = computed(() =>
    missingFormulaTargetKeys(
      this.formulaRows(),
      PVP_TRAVEL_TIMING_FORMULA_TARGET_KEYS,
    ),
  );
  readonly enabledFormulaCount = computed(() =>
    this.formulaRows().filter((row) => row.status === 'enabled').length,
  );

  ngOnInit(): void {
    this.loadData();
  }

  formulaStatusClass(row: FormulaTargetAssignmentRow): string {
    return row.status === 'enabled'
      ? 'tag-badge tag-badge--info'
      : 'tag-badge tag-badge--warn';
  }

  contextPreview(row: FormulaTargetAssignmentRow): string {
    return formulaTargetContextPreview(row);
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.travelTiming.getData()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => this.data.set(data),
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(error, 'Failed to load PvP travel timing data.'),
          ),
      });
  }
}
