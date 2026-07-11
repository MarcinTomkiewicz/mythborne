import type { GameCopyEditTarget } from '../domain/game-copy/game-copy-edit.model';

export type StructuredDialogTone = 'plain' | 'heading' | 'danger';

export interface StructuredDialogSegment {
  text: string;
  tone: StructuredDialogTone;
}

export interface StructuredDialogParagraph {
  segments: readonly StructuredDialogSegment[];
}

export interface StructuredDialogText {
  text: string;
  editTarget?: GameCopyEditTarget;
}

export interface StructuredDialogMessage {
  paragraphs: readonly StructuredDialogParagraph[];
  editTarget?: GameCopyEditTarget;
}

export interface StructuredConfirmDialogContent {
  header?: StructuredDialogText;
  message: StructuredDialogMessage;
  accept?: StructuredDialogText;
  reject?: StructuredDialogText;
}
