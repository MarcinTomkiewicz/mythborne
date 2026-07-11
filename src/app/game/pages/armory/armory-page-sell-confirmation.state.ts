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
  buildSellItemConfirmationParagraphs,
  buildSellSelectedConfirmationParagraphs,
} from '../../../core/domain/item/player-armory-page-helpers';
import type {
  StructuredConfirmDialogContent,
  StructuredDialogParagraph,
} from '../../../core/interfaces/structured-dialog-content.interface';
import { plainStructuredConfirmMessage } from '../../../core/utils/structured-confirm-dialog/plain-structured-confirm-message';

@Injectable()
export class ArmoryPageSellConfirmationState {
  private readonly confirmationService = inject(ConfirmationService);

  readonly key = ARMORY_SELL_ITEM_CONFIRMATION_KEY;
  readonly content = signal<StructuredConfirmDialogContent>({
    message: { paragraphs: [] },
  });

  confirmItem(
    copy: PlayerArmoryPageCopyReadModel,
    item: PlayerArmoryItemReadModel,
    accept: () => void,
  ): void {
    const messageParagraphs = buildSellItemConfirmationParagraphs(
      copy.confirmations.sellItemMessageParts,
      copy.confirmations.sellItemHighlightFields,
      item.displayCore.itemName,
      item.displayCore.valueDisplay.displayValue,
    );

    this.confirm(copy, messageParagraphs, accept);
  }

  confirmSelectedItems(
    copy: PlayerArmoryPageCopyReadModel,
    items: readonly PlayerArmoryItemReadModel[],
    accept: () => void,
  ): void {
    const messageParagraphs = buildSellSelectedConfirmationParagraphs(
      copy.confirmations.sellSelectedMessageParts,
      copy.confirmations.sellSelectedHighlightFields,
      items,
    );

    if (!messageParagraphs.length) {
      return;
    }

    this.confirm(copy, messageParagraphs, accept);
  }

  clear(): void {
    this.content.set({ message: { paragraphs: [] } });
  }

  private confirm(
    copy: PlayerArmoryPageCopyReadModel,
    messageParagraphs: readonly StructuredDialogParagraph[],
    accept: () => void,
  ): void {
    const content: StructuredConfirmDialogContent = {
      message: { paragraphs: messageParagraphs },
    };

    this.content.set(content);
    this.confirmationService.confirm({
      key: this.key,
      header: copy.confirmations.sellItemTitle,
      message: plainStructuredConfirmMessage(content),
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
