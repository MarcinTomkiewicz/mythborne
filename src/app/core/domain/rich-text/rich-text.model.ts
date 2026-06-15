export type RichTextTone =
  | 'heading'
  | 'info'
  | 'warn'
  | 'success'
  | 'danger'
  | 'muted';

export interface RichTextFragment {
  kind: string;
  text: string;
  tone?: RichTextTone;
  token?: string;
  value?: number;
  displayValue?: string;
  resourceKey?: string;
  statKey?: string;
  effectKey?: string;
  effectKind?: string;
  itemId?: string;
  itemName?: string;
  itemPublicToken?: string | null;
  metadata?: Record<string, unknown>;
}

export interface RichTextItemReference {
  sourceItemId: string | null;
  itemReferenceId: string;
}
