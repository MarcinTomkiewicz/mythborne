import type {
  StructuredConfirmDialogSegment,
} from '../../interfaces/structured-confirm-dialog-segment.interface';

export function plainStructuredConfirmMessage(
  segments: readonly StructuredConfirmDialogSegment[],
): string {
  return segments
    .map((segment) => `${segment.text}${segment.lineBreakAfter ? '\n' : ''}`)
    .join('');
}
