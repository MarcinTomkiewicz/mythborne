import type { StructuredDialogParagraph } from '../../interfaces/structured-dialog-content.interface';
import type { PlayerVicinityCopyReadModel } from './player-vicinity-page-context.model';

export function mapRelocationParagraphs(
  copy: PlayerVicinityCopyReadModel['relocation'],
): StructuredDialogParagraph[] {
  const parts = copy.confirmMessageParts;

  return [
    { segments: [{ text: parts.intro, tone: 'plain' }] },
    {
      segments: [
        { text: `${parts.warningLabel} `, tone: 'danger' },
        { text: parts.warningText, tone: 'plain' },
      ],
    },
  ];
}
