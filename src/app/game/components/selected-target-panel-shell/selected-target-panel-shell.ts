import { Component, input, output } from '@angular/core';
import type { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import type {
  DataRow,
  DataRowActionEvent,
} from '../../../core/types/data-row.types';
import { DataRowActions } from '../data-row-actions/data-row-actions';

@Component({
  selector: 'app-selected-target-panel-shell',
  standalone: true,
  imports: [DataRowActions],
  host: { class: 'd-contents' },
  templateUrl: './selected-target-panel-shell.html',
})
export class SelectedTargetPanelShell {
  readonly eyebrowLabel = input<string | null>(null);
  readonly title = input<string | null>(null);
  readonly subtitle = input<string | null>(null);
  readonly reserveSubtitle = input(false);
  readonly emptyTitle = input<string | null>(null);
  readonly emptyText = input<string | null>(null);
  readonly factRows = input<readonly GamePageSummaryRow[]>([]);
  readonly actionRow = input<DataRow | null>(null);
  readonly error = input<string | null>(null);
  readonly success = input<string | null>(null);
  readonly startAction = output<DataRowActionEvent<DataRow>>();
}
