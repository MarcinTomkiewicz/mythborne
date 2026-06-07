import { Component, input } from '@angular/core';
import type { ExplorationRewardTextViewModel } from '../../../core/domain/exploration/exploration-result-display.model';
import { ExplorationGeneratedRewardItemReadModel, RewardGrantEntryReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import { ItemDetailPopover } from '../../../shared/item-detail-popover/item-detail-popover';
import {
  rewardDisplay as explorationRewardDisplay,
  rewardEntryAmount,
  rewardEntryName,
  rewardItemLabel,
} from '../../pages/exploration/exploration-reward-card-ui';
import { ReportDetailPreviewCard } from '../report-detail-preview-card/report-detail-preview-card';

@Component({
  selector: 'app-exploration-report-result-content',
  standalone: true,
  imports: [
    ItemDetailPopover,
    ReportDetailPreviewCard,
  ],
  templateUrl: './exploration-report-result-content.html',
  host: { class: 'd-block w-100' },
})
export class ExplorationReportResultContent {
  readonly reportId = input.required<string>();
  readonly reportLabel = input<string | undefined>(undefined);
  readonly rewardText = input.required<ExplorationRewardTextViewModel>();
  readonly isLoadingReward = input(false);
  readonly rewardDisplay = input<ReturnType<typeof explorationRewardDisplay>>(null);
  readonly rewardUnavailableMessage = input<string | null>(null);

  entryAmount(entry: RewardGrantEntryReadModel): number | null {
    return rewardEntryAmount(entry);
  }

  entryName(entry: RewardGrantEntryReadModel): string {
    return rewardEntryName(entry);
  }

  itemLabel(item: ExplorationGeneratedRewardItemReadModel): string {
    return rewardItemLabel(item);
  }
}
