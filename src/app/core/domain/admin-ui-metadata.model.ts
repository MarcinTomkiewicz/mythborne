import { Json } from '../types/database.types';

export interface UiMetadataEntryReadModel {
  id: string;
  namespace: string;
  key: string;
  label: string;
  description: string | null;
  helperText: string | null;
  impactSummary: string | null;
  warningText: string | null;
  uiGroupKey: string | null;
  uiGroupLabel: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}
