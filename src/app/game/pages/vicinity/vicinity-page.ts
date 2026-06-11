import { Component, DestroyRef, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { RouteBackgroundOverride } from '../../../core/services/ui/route-background-override';
import {
  PVP_ACTIVE_ACTION_COPY,
  PVP_SPY_BACKGROUND_IMAGE,
  PVP_SPY_BACKGROUND_SOURCE,
} from '../../../core/configs/pvp-active-action-ui.config';
import { PvpActionRunner } from '../../../core/services/pvp/pvp-action-runner';
import { DataRowList } from '../../components/data-row-list/data-row-list';
import { PvpActiveActionPanel } from '../../components/pvp-active-action-panel/pvp-active-action-panel';
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
import { VicinityTargetSearchState } from '../../features/vicinity/state/vicinity-target-search.state';
import { VicinityVisibleTargetOverlayState } from '../../features/vicinity/state/vicinity-visible-target-overlay.state';
import type {
  PlayerVicinityCopyReadModel,
} from '../../../core/domain/vicinity/player-vicinity-page-context.model';
import type {
  StructuredConfirmDialogSegment,
} from '../../../core/interfaces/structured-confirm-dialog-segment.interface';
import { GamePageHeader } from '../../../shared/game-page-header/game-page-header';
import { EstateRelocationRunner } from '../../workflows/estate-relocation/estate-relocation-runner';
import {
  AddressDataRow,
  DataRow,
  DataRowActionKind,
} from '../../../core/types/data-row.types';
import { isAddressDataRow } from '../../../core/utils/data-row';
import { StructuredConfirmDialog } from '../../../shared/structured-confirm-dialog/structured-confirm-dialog';

const VICINITY_RELOCATION_CONFIRMATION_KEY = 'vicinity-relocation';

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
    DataRowList,
    VicinityPagination,
    VicinitySelectedTargetPanel,
    VicinityToolbar,
  ],
  providers: [
    VicinityPageState,
    PvpActiveActionState,
    PvpActiveActionNavigationState,
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
  private readonly pvpActiveActionNavigation = inject(PvpActiveActionNavigationState);
  private readonly routeBackgroundOverride = inject(RouteBackgroundOverride);

  readonly pvpActiveActionCopy = PVP_ACTIVE_ACTION_COPY;
  readonly page = inject(VicinityPageState);
  readonly activePvpAction = inject(PvpActiveActionState);
  readonly actions = inject(VicinityPvpActionsState);
  readonly metadata = inject(VicinityPvpMetadataState);
  readonly rowsState = inject(VicinityRowsState);
  readonly search = inject(VicinitySearchState);
  readonly spyReport = inject(PvpSpyReportState);
  readonly targetSearch = inject(VicinityTargetSearchState);
  readonly targetOverlay = inject(VicinityVisibleTargetOverlayState);
  readonly relocationConfirmationSegments =
    signal<readonly StructuredConfirmDialogSegment[]>([]);
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
      this.activePvpAction.setCopy(this.pvpActiveActionCopy.state);
      this.activePvpAction.setGenericErrorLabel(this.page.copyJson()?.page.errorLabel ?? null);
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

    void this.pvpActiveActionNavigation;
  }

  ngOnInit(): void {
    this.page.loadData();
    this.activePvpAction.load();
    this.page.loadDailyAttackState();
    this.page.loadEstateRuntimeState();
    this.metadata.load();
  }

  clearRelocationConfirmationMessage(): void {
    this.relocationConfirmationSegments.set([]);
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

  private confirmClaimEstate(row: AddressDataRow): void {
    const copy = this.page.copyJson()?.relocation;

    if (row.kind !== 'empty' || !copy || this.page.isRelocating()) {
      return;
    }

    this.rowsState.selectRow(row);

    if (!this.page.selectedTarget()) {
      return;
    }

    this.relocationConfirmationSegments.set(buildRelocationConfirmationSegments(copy));
    this.confirmationService.confirm({
      key: VICINITY_RELOCATION_CONFIRMATION_KEY,
      header: copy.confirmTitle,
      message: copy.confirmMessage,
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

function buildRelocationConfirmationSegments(
  copy: PlayerVicinityCopyReadModel['relocation'],
): StructuredConfirmDialogSegment[] {
  const parts = copy.confirmMessageParts;

  return [
    { text: parts.intro, highlighted: false, blankLineAfter: true },
    { text: `${parts.warningLabel} `, highlighted: true, className: 'error-text' },
    { text: parts.warningText, highlighted: false },
  ];
}
