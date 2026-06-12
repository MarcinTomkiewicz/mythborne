export interface SourceRefLike {
  sourceEntityType: string;
  sourceEntityId: string;
}

export function sameSourceRef(
  current: SourceRefLike | null,
  next: SourceRefLike | null,
): boolean {
  return current?.sourceEntityType === next?.sourceEntityType &&
    current?.sourceEntityId === next?.sourceEntityId;
}
