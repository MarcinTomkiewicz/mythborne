import { Component, input } from '@angular/core';
import {
  RichTextFragment,
  RichTextItemReference,
} from '../../core/domain/rich-text/rich-text.model';
import type { ItemPopoverContextKey } from '../../core/domain/item/item-detail-popover.model';
import { ItemDetailPopover } from '../item-detail-popover/item-detail-popover';

@Component({
  selector: 'app-rich-text',
  standalone: true,
  imports: [ItemDetailPopover],
  templateUrl: './rich-text.html',
})
export class RichText {
  readonly fragments = input.required<readonly RichTextFragment[]>();
  readonly visibility = input<'private' | 'public'>('private');
  readonly publicToken = input<string | null>(null);
  readonly itemPopoverContext = input<ItemPopoverContextKey | null>(null);
  readonly itemReferences = input<readonly RichTextItemReference[]>([]);

  fragmentTrackKey(index: number, fragment: RichTextFragment): string {
    return `${fragment.kind}:${fragment.itemId ?? ''}:${fragment.text}:${index}`;
  }

  itemText(fragment: RichTextFragment): string {
    return fragment.itemName?.trim() || fragment.text;
  }

  itemReferenceId(fragment: RichTextFragment): string | null {
    if (fragment.kind !== 'itemRef' || !fragment.itemId?.trim() || this.visibility() !== 'public') {
      return null;
    }

    return this.itemReferences().find((item) => item.sourceItemId === fragment.itemId)
      ?.itemReferenceId ?? null;
  }

  canRenderItemPopover(fragment: RichTextFragment): boolean {
    if (fragment.kind !== 'itemRef' || !fragment.itemId?.trim()) {
      return false;
    }

    return this.visibility() === 'private'
      ? Boolean(this.itemPopoverContext()?.trim())
      : Boolean(this.publicToken()?.trim() && this.itemReferenceId(fragment));
  }

  popoverItemId(fragment: RichTextFragment): string | null {
    return this.visibility() === 'private' ? fragment.itemId ?? null : null;
  }

  popoverPublicToken(): string | null {
    return this.visibility() === 'public' ? this.publicToken() : null;
  }

  popoverContext(): ItemPopoverContextKey {
    const context = this.visibility() === 'private'
      ? this.itemPopoverContext()
      : 'public_report';

    if (!context) {
      throw new Error('RichText item popover context is required for itemRef fragments.');
    }

    return context;
  }

  fragmentToneClass(fragment: RichTextFragment): string {
    if (fragment.tone === 'heading') {
      return 'color-heading font-bold';
    }

    if (fragment.tone === 'info') {
      return 'info-text';
    }

    if (fragment.tone === 'warn') {
      return 'warn-text';
    }

    if (fragment.tone === 'success') {
      return 'success-text';
    }

    if (fragment.tone === 'danger') {
      return 'error-text';
    }

    if (fragment.tone === 'muted') {
      return 'color-muted';
    }

    return '';
  }
}
