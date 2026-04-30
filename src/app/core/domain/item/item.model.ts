import { Json } from '../../types/database.types';
import { Row } from '../../types/supabase.types';

export type ItemStatus = Row<'items'>['status'];

export interface ItemReadModel {
  id: string;
  serverId: string;
  heroId: string;
  name: string;
  description: string | null;
  status: ItemStatus;
  generationBaseId: string | null;
  generationQualityKey: string | null;
  prefixAffixId: string | null;
  suffixAffixId: string | null;
  armoryShelfPosition: number;
  drachmaValue: number | null;
  metadataJson: Json;
  generatedAt: string;
  scrappedAt: string | null;
  recoverableUntil: string | null;
  createdAt: string | null;
  updatedAt: string;
}
