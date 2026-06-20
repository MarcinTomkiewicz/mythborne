import { Injectable, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import {
  ARMORY_SELL_ITEM_CONFIRMATION_KEY,
  ARMORY_SELL_ITEM_CONFIRMATION_UI,
} from '../../../core/constants/armory-confirmation.const';
import {
  PlayerArmoryItemReadModel,
  PlayerArmoryPageCopyReadModel,
} from '../../../core/domain/item/player-armory-page-context.model';
import {
  buildSellItemConfirmationSegments,
  buildSellSelectedConfirmationSegments,
} from '../../../core/domain/item/player-armory-page-helpers';
import type {
  StructuredConfirmDialogSegment,
} from '../../../core/interfaces/structured-confirm-dialog-segment.interface';
import { plainStructuredConfirmMessage } from '../../../core/utils/structured-confirm-dialog/plain-structured-confirm-message';

@Injectable()
export class ArmoryPageSellConfirmationState {
  private readonly confirmationService = inject(ConfirmationService);

  readonly key = ARMORY_SELL_ITEM_CONFIRMATION_KEY;
  readonly segments = signal<readonly StructuredConfirmDialogSegment[]>([]);

  confirmItem(
    copy: PlayerArmoryPageCopyReadModel,
    item: PlayerArmoryItemReadModel,
    accept: () => void,
  ): void {
    const messageSegments = buildSellItemConfirmationSegments(
      copy.confirmations.sellItemMessageParts,
      copy.confirmations.sellItemHighlightFields,
      item.displayCore.itemName,
      item.displayCore.valueDisplay.displayValue,
    );

    this.confirm(copy, messageSegments, accept);
  }

  confirmSelectedItems(
    copy: PlayerArmoryPageCopyReadModel,
    items: readonly PlayerArmoryItemReadModel[],
    accept: () => void,
  ): void {
    const messageSegments = buildSellSelectedConfirmationSegments(
      copy.confirmations.sellSelectedMessageParts,
      copy.confirmations.sellSelectedHighlightFields,
      items,
    );

    if (!messageSegments.length) {
      return;
    }

    this.confirm(copy, messageSegments, accept);
  }

  clear(): void {
    this.segments.set([]);
  }

  private confirm(
    copy: PlayerArmoryPageCopyReadModel,
    messageSegments: readonly StructuredConfirmDialogSegment[],
    accept: () => void,
  ): void {
    this.segments.set(messageSegments);
    this.confirmationService.confirm({
      key: this.key,
      header: copy.confirmations.sellItemTitle,
      message: plainStructuredConfirmMessage(messageSegments),
      acceptLabel: copy.confirmations.confirmLabel,
      rejectLabel: copy.confirmations.cancelLabel,
      acceptIcon: ARMORY_SELL_ITEM_CONFIRMATION_UI.acceptIcon,
      rejectIcon: ARMORY_SELL_ITEM_CONFIRMATION_UI.rejectIcon,
      acceptButtonStyleClass: ARMORY_SELL_ITEM_CONFIRMATION_UI.acceptButtonStyleClass,
      rejectButtonStyleClass: ARMORY_SELL_ITEM_CONFIRMATION_UI.rejectButtonStyleClass,
      accept,
      reject: () => this.clear(),
    });
  }
}
