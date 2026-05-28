import { Component, OnInit, computed, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { VicinityAddressList } from '../../components/vicinity/address-list/vicinity-address-list';
import { VicinityPagination } from '../../components/vicinity/pagination/vicinity-pagination';
import { VicinitySelectedTargetPanel } from '../../components/vicinity/selected-target-panel/vicinity-selected-target-panel';
import { VicinityToolbar } from '../../components/vicinity/toolbar/vicinity-toolbar';
import { VicinityHeaderSummaryState } from '../../features/vicinity/state/vicinity-header-summary.state';
import { VicinityPageState } from '../../features/vicinity/state/vicinity-page.state';
import { VicinityPvpActionsState } from '../../features/vicinity/state/vicinity-pvp-actions.state';
import { VicinityPvpMetadataState } from '../../features/vicinity/state/vicinity-pvp-metadata.state';
import { VicinityRangeState } from '../../features/vicinity/state/vicinity-range.state';
import { VicinityRelocationState } from '../../features/vicinity/state/vicinity-relocation.state';
import { VicinityRowsState } from '../../features/vicinity/state/vicinity-rows.state';
import { VicinitySearchState } from '../../features/vicinity/state/vicinity-search.state';
import { VicinityTargetCandidatesState } from '../../features/vicinity/state/vicinity-target-candidates.state';
import { VicinityTargetSearchState } from '../../features/vicinity/state/vicinity-target-search.state';
import { VicinityVisibleTargetOverlayState } from '../../features/vicinity/state/vicinity-visible-target-overlay.state';
import { LoadingOverlay } from '../../../shared/loading-overlay/loading-overlay';
import { EstateRelocationRunner } from '../../workflows/estate-relocation/estate-relocation-runner';

@Component({
  selector: 'app-vicinity-page',
  standalone: true,
  host: {
    class: 'd-contents min-w-0',
  },
  imports: [
    ConfirmDialogModule,
    LoadingOverlay,
    VicinityAddressList,
    VicinityPagination,
    VicinitySelectedTargetPanel,
    VicinityToolbar,
  ],
  providers: [
    VicinityPageState,
    VicinityHeaderSummaryState,
    VicinityRangeState,
    VicinityRelocationState,
    VicinityRowsState,
    VicinityPvpActionsState,
    VicinityPvpMetadataState,
    VicinitySearchState,
    VicinityTargetSearchState,
    VicinityVisibleTargetOverlayState,
    EstateRelocationRunner,
    VicinityTargetCandidatesState,
  ],
  templateUrl: './vicinity-page.html',
})
export class VicinityPage implements OnInit {
  private readonly confirmationService = inject(ConfirmationService);

  readonly page = inject(VicinityPageState);
  readonly metadata = inject(VicinityPvpMetadataState);
  readonly pvpTargets = inject(VicinityTargetCandidatesState);
  readonly rowsState = inject(VicinityRowsState);
  readonly search = inject(VicinitySearchState);
  readonly isScreenLoading = computed(() =>
    this.page.error() === null
    && (
      this.page.isLoading()
      || this.page.isDailyAttackLoading()
      || this.page.isEstateRuntimeLoading()
      || this.pvpTargets.isVisibleOverlayLoading()
      || !this.pvpTargets.visibleOverlayLoaded()
      || !this.metadata.loaded()
    ),
  );

  ngOnInit(): void {
    this.page.loadData();
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
