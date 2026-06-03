import { Component, DestroyRef, OnInit, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RouteBackgroundOverride } from '../../../core/services/ui/route-background-override';
import {
  SUPABASE_ASSET_IMAGE_TRANSFORMS,
  supabaseStorageCssImageUrl,
} from '../../../core/config/storage-assets.config';
import { VicinityActivePvpActionPanel } from '../../components/vicinity/active-pvp-action-panel/vicinity-active-pvp-action-panel';
import { VicinityAddressList } from '../../components/vicinity/address-list/vicinity-address-list';
import { VicinityPagination } from '../../components/vicinity/pagination/vicinity-pagination';
import { VicinitySelectedTargetPanel } from '../../components/vicinity/selected-target-panel/vicinity-selected-target-panel';
import { VicinityToolbar } from '../../components/vicinity/toolbar/vicinity-toolbar';
import { VicinityActivePvpActionState } from '../../features/vicinity/state/vicinity-active-pvp-action.state';
import { VicinityHeaderSummaryState } from '../../features/vicinity/state/vicinity-header-summary.state';
import { VicinityPageState } from '../../features/vicinity/state/vicinity-page.state';
import { VicinityPvpActionsState } from '../../features/vicinity/state/vicinity-pvp-actions.state';
import { VicinityPvpMetadataState } from '../../features/vicinity/state/vicinity-pvp-metadata.state';
import { VicinityRangeState } from '../../features/vicinity/state/vicinity-range.state';
import { VicinityRelocationState } from '../../features/vicinity/state/vicinity-relocation.state';
import { VicinityRowsState } from '../../features/vicinity/state/vicinity-rows.state';
import { VicinitySearchState } from '../../features/vicinity/state/vicinity-search.state';
import { VicinitySpyReportState } from '../../features/vicinity/state/vicinity-spy-report.state';
import { VicinityTargetSearchState } from '../../features/vicinity/state/vicinity-target-search.state';
import { VicinityVisibleTargetOverlayState } from '../../features/vicinity/state/vicinity-visible-target-overlay.state';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { EstateRelocationRunner } from '../../workflows/estate-relocation/estate-relocation-runner';

const SPY_BACKGROUND_SOURCE = 'vicinity-spy';
const SPY_BACKGROUND_IMAGE = supabaseStorageCssImageUrl(
  'backgrounds/spy-background.png',
  SUPABASE_ASSET_IMAGE_TRANSFORMS.background,
);

@Component({
  selector: 'app-vicinity-page',
  standalone: true,
  host: {
    class: 'd-contents min-w-0',
  },
  imports: [
    ConfirmDialogModule,
    LoadingOverlay,
    VicinityActivePvpActionPanel,
    VicinityAddressList,
    VicinityPagination,
    VicinitySelectedTargetPanel,
    VicinityToolbar,
  ],
  providers: [
    VicinityPageState,
    VicinityActivePvpActionState,
    VicinityHeaderSummaryState,
    VicinityRangeState,
    VicinityRelocationState,
    VicinityRowsState,
    VicinityPvpActionsState,
    VicinityPvpMetadataState,
    VicinitySearchState,
    VicinitySpyReportState,
    VicinityTargetSearchState,
    VicinityVisibleTargetOverlayState,
    EstateRelocationRunner,
  ],
  templateUrl: './vicinity-page.html',
})
export class VicinityPage implements OnInit {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly routeBackgroundOverride = inject(RouteBackgroundOverride);
  private navigatedPvpActionId: string | null = null;
  private navigatedSpyReportId: string | null = null;

  readonly page = inject(VicinityPageState);
  readonly activePvpAction = inject(VicinityActivePvpActionState);
  readonly actions = inject(VicinityPvpActionsState);
  readonly metadata = inject(VicinityPvpMetadataState);
  readonly rowsState = inject(VicinityRowsState);
  readonly search = inject(VicinitySearchState);
  readonly spyReport = inject(VicinitySpyReportState);
  readonly targetSearch = inject(VicinityTargetSearchState);
  readonly targetOverlay = inject(VicinityVisibleTargetOverlayState);
  readonly isScreenLoading = computed(() =>
    this.page.error() === null
    && (
      this.page.isLoading()
      || this.activePvpAction.isLoading()
      || this.page.isDailyAttackLoading()
      || this.page.isEstateRuntimeLoading()
      || this.targetOverlay.isLoading()
      || !this.targetOverlay.loaded()
      || !this.metadata.loaded()
    ),
  );

  constructor() {
    effect(() => {
      const offer = this.activePvpAction.visibleOffer();

      if (
        !offer
        || offer.actionKind !== 'attack'
        || !offer.isManualWindow
        || offer.isResolved
        || !offer.pvpActionId
        || this.navigatedPvpActionId === offer.pvpActionId
      ) {
        return;
      }

      this.navigatedPvpActionId = offer.pvpActionId;
      queueMicrotask(() => {
        void this.router.navigate(['/game/combat'], {
          queryParams: {
            sourceEntityType: 'pvp_action',
            sourceEntityId: offer.pvpActionId,
          },
        });
      });
    });

    effect(() => {
      const reportId = this.spyReport.reportId();

      if (!reportId || this.navigatedSpyReportId === reportId) {
        return;
      }

      this.navigatedSpyReportId = reportId;
      queueMicrotask(() => {
        void this.router.navigate(['/game/reports', reportId]);
      });
    });

    effect(() => {
      const offer = this.activePvpAction.visibleOffer();

      if (offer?.actionKind === 'spy' || this.spyReport.isPreparingReport()) {
        this.routeBackgroundOverride.set(SPY_BACKGROUND_SOURCE, SPY_BACKGROUND_IMAGE);
        return;
      }

      this.routeBackgroundOverride.clear(SPY_BACKGROUND_SOURCE);
    });

    this.destroyRef.onDestroy(() => {
      this.routeBackgroundOverride.clear(SPY_BACKGROUND_SOURCE);
    });
  }

  ngOnInit(): void {
    this.page.loadData();
    this.activePvpAction.load();
    this.page.loadDailyAttackState();
    this.page.loadEstateRuntimeState();
    this.metadata.load();
  }

  confirmRelocation(): void {
    const selected = this.rowsState.selectedRow();

    if (selected?.kind !== 'empty' || !this.page.selectedTarget()) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Potwierdź przeprowadzkę',
      message: (
        'Przeniesiesz się na wybrany pusty adres. Stara posiadłość zostanie ' +
        'całkowicie zniszczona i zresetowana: aktywne poziomy, prace oraz postęp ' +
        'posiadłości nie zostaną zachowane. Nowa posiadłość powstanie w domyślnym ' +
        'stanie dla wskazanego adresu.'
      ),
      acceptLabel: 'Przeprowadź się',
      rejectLabel: 'Anuluj',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.page.setDestructiveConfirmed(true);
        this.page.relocate();
      },
    });
  }

}
