import type {
  StructuredConfirmDialogContent,
} from '../../interfaces/structured-dialog-content.interface';

export function plainStructuredConfirmMessage(
  content: StructuredConfirmDialogContent,
): string {
  return content.message.paragraphs
    .map((paragraph) => paragraph.segments.map((segment) => segment.text).join(''))
    .join('\n\n');
}
