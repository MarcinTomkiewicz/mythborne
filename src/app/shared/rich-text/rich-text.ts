import { Component, input } from '@angular/core';
import { RichTextFragment } from '../../core/domain/rich-text/rich-text.model';
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

  fragmentTrackKey(index: number, fragment: RichTextFragment): string {
    return `${fragment.kind}:${fragment.itemReferenceId ?? fragment.itemId ?? ''}:${fragment.text}:${index}`;
  }

  itemText(fragment: RichTextFragment): string {
    return fragment.itemName?.trim() || fragment.text;
  }

  itemReferenceId(fragment: RichTextFragment): string | null {
    if (fragment.kind !== 'itemRef' || this.visibility() !== 'public') {
      return null;
    }

    return fragment.itemReferenceId?.trim() || null;
  }

  canRenderItemPopover(fragment: RichTextFragment): boolean {
    if (fragment.kind !== 'itemRef') {
      return false;
    }

    return this.visibility() === 'private'
      ? Boolean(fragment.itemId?.trim() && this.itemPopoverContext()?.trim())
      : Boolean(this.publicToken()?.trim() && this.itemReferenceId(fragment));
  }

  missingItemReferenceDiagnostic(fragment: RichTextFragment): string | null {
    return this.visibility() === 'public' &&
      fragment.kind === 'itemRef' &&
      !fragment.itemReferenceId?.trim()
      ? 'richText.itemRef.itemReferenceId'
      : null;
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
