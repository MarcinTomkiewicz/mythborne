import { Component, DestroyRef, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { VICINITY_RELOCATION_DIALOG_KEY } from '../../../core/configs/vicinity.config';
import { RouteBackgroundOverride } from '../../../core/services/ui/route-background-override';
import {
  PVP_SPY_BACKGROUND_IMAGE,
  PVP_SPY_BACKGROUND_SOURCE,
} from '../../../core/configs/pvp-active-action-ui.config';
import { PvpActionRunner } from '../../../core/services/pvp/pvp-action-runner';
import { DataRowList } from '../../components/data-row-list/data-row-list';
import { PvpActiveActionPanel } from '../../components/pvp-active-action-panel/pvp-active-action-panel';
import { PvpSandboxTools } from '../../components/pvp-sandbox-tools/pvp-sandbox-tools';
import { VicinityPagination } from '../../components/vicinity/pagination/vicinity-pagination';
import { VicinitySelectedTargetPanel } from '../../components/vicinity/selected-target-panel/vicinity-selected-target-panel';
import { VicinityToolbar } from '../../components/vicinity/toolbar/vicinity-toolbar';
import { PvpActiveActionState } from '../../features/pvp/state/pvp-active-action.state';
import { PvpActiveActionNavigationState } from '../../features/pvp/state/pvp-active-action-navigation.state';
import { VicinityHeaderSummaryState } from '../../features/vicinity/state/vicinity-header-summary.state';
import { VicinityPageState } from '../../features/vicinity/state/vicinity-page.state';
import { VicinityPvpActionsState } from '../../features/vicinity/state/vicinity-pvp-actions.state';
import { VicinityPvpMetadataState } from '../../features/vicinity/state/vicinity-pvp-metadata.state';
import { VicinityRangeState } from '../../features/vicinity/state/vicinity-range.state';
import { VicinityRelocationState } from '../../features/vicinity/state/vicinity-relocation.state';
import { VicinityRowsState } from '../../features/vicinity/state/vicinity-rows.state';
import { VicinitySearchState } from '../../features/vicinity/state/vicinity-search.state';
import { PvpSpyReportState } from '../../features/pvp/state/pvp-spy-report.state';
import { PvpSandboxToolState } from '../../features/pvp/state/pvp-sandbox-tool.state';
import { VicinityTargetSearchState } from '../../features/vicinity/state/vicinity-target-search.state';
import { VicinityVisibleTargetOverlayState } from '../../features/vicinity/state/vicinity-visible-target-overlay.state';
import { mapRelocationParagraphs } from '../../../core/domain/vicinity/vicinity-relocation-message';
import type {
  StructuredConfirmDialogContent,
} from '../../../core/interfaces/structured-dialog-content.interface';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { EstateRelocationRunner } from '../../workflows/estate-relocation/estate-relocation-runner';
import {
  AddressDataRow,
  DataRow,
  DataRowActionKind,
} from '../../../core/types/data-row.types';
import { isAddressDataRow } from '../../../core/utils/data-row';
import { plainStructuredConfirmMessage } from '../../../core/utils/structured-confirm-dialog/plain-structured-confirm-message';
import { StructuredConfirmDialog } from '../../../shared/structured-confirm-dialog/structured-confirm-dialog';

@Component({
  selector: 'app-vicinity-page',
  standalone: true,
  host: {
    class: 'd-contents min-w-0',
  },
  imports: [
    GamePageHeader,
    StructuredConfirmDialog,
    PvpActiveActionPanel,
    PvpSandboxTools,
    DataRowList,
    VicinityPagination,
    VicinitySelectedTargetPanel,
    VicinityToolbar,
  ],
  providers: [
    VicinityPageState,
    PvpActiveActionState,
    PvpActiveActionNavigationState,
    PvpSandboxToolState,
    VicinityHeaderSummaryState,
    VicinityRangeState,
    VicinityRelocationState,
    VicinityRowsState,
    PvpActionRunner,
    VicinityPvpActionsState,
    VicinityPvpMetadataState,
    VicinitySearchState,
    PvpSpyReportState,
    VicinityTargetSearchState,
    VicinityVisibleTargetOverlayState,
    EstateRelocationRunner,
  ],
  templateUrl: './vicinity-page.html',
})
export class VicinityPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly pvpNavigation = inject(PvpActiveActionNavigationState);
  private readonly routeBackgroundOverride = inject(RouteBackgroundOverride);

  readonly page = inject(VicinityPageState);
  readonly activePvpAction = inject(PvpActiveActionState);
  readonly actions = inject(VicinityPvpActionsState);
  readonly metadata = inject(VicinityPvpMetadataState);
  readonly rowsState = inject(VicinityRowsState);
  readonly search = inject(VicinitySearchState);
  readonly spyReport = inject(PvpSpyReportState);
  readonly targetSearch = inject(VicinityTargetSearchState);
  readonly targetOverlay = inject(VicinityVisibleTargetOverlayState);
  readonly relocationConfirmationKey = VICINITY_RELOCATION_DIALOG_KEY;
  readonly relocationConfirmationContent = signal<StructuredConfirmDialogContent>({
    message: { paragraphs: [] },
  });
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
      this.activePvpAction.setGenericErrorLabel(this.page.copyJson()?.page.errorLabel ?? null);
    });

    effect(() => {
      if (this.activePvpAction.returnClearedRevision() === 0) {
        return;
      }

      this.refreshPvpSandboxCounters();
    });

    effect(() => {
      const offer = this.activePvpAction.visibleOffer();

      if (offer?.actionKind === 'spy' || this.spyReport.isPreparingReport()) {
        this.routeBackgroundOverride.set(PVP_SPY_BACKGROUND_SOURCE, PVP_SPY_BACKGROUND_IMAGE);
        return;
      }

      this.routeBackgroundOverride.clear(PVP_SPY_BACKGROUND_SOURCE);
    });

    this.destroyRef.onDestroy(() => {
      this.routeBackgroundOverride.clear(PVP_SPY_BACKGROUND_SOURCE);
    });

  }

  ngOnInit(): void {
    this.pvpNavigation.initialize();
    this.page.loadData();
    this.activePvpAction.load();
    this.page.loadDailyAttackState();
    this.page.loadEstateRuntimeState();
    this.metadata.load();
  }

  clearRelocationConfirmationMessage(): void {
    this.relocationConfirmationContent.set({ message: { paragraphs: [] } });
  }

  selectRow(row: DataRow): void {
    if (!isAddressDataRow(row)) {
      return;
    }

    this.rowsState.selectRow(row);
  }

  handleRowAction(row: DataRow, actionKind: DataRowActionKind): void {
    if (!isAddressDataRow(row)) {
      return;
    }

    if (actionKind === 'claimEstate') {
      this.confirmClaimEstate(row);
      return;
    }

    this.rowsState.startRowAction(row, actionKind);
  }

  refreshPvpSandboxCounters(): void {
    this.page.loadDailyAttackState();
    this.page.loadData();
  }

  private confirmClaimEstate(row: AddressDataRow): void {
    const copy = this.page.copyJson()?.relocation;

    if (row.kind !== 'empty' || !copy || this.page.isRelocating()) {
      return;
    }

    this.rowsState.selectRow(row);

    if (!this.page.selectedTarget()) {
      return;
    }

    const content: StructuredConfirmDialogContent = {
      message: { paragraphs: mapRelocationParagraphs(copy) },
    };

    this.relocationConfirmationContent.set(content);
    this.confirmationService.confirm({
      key: this.relocationConfirmationKey,
      header: copy.confirmTitle,
      message: plainStructuredConfirmMessage(content),
      acceptLabel: copy.confirmLabel,
      rejectLabel: copy.cancelLabel,
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      accept: () => {
        this.page.setDestructiveConfirmed(true);
        this.page.relocate();
      },
      reject: () => this.page.setDestructiveConfirmed(false),
    });
  }
}
