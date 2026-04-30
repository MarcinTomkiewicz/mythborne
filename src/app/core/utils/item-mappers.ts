import { ItemReadModel } from '../domain/item/item.model';
import { Row } from '../types/supabase.types';

export function mapItemReadModel(row: Row<'items'>): ItemReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    heroId: row.hero_id,
    name: row.name,
    description: row.description,
    status: row.status,
    generationBaseId: row.generation_base_id,
    generationQualityKey: row.generation_quality_key,
    prefixAffixId: row.prefix_affix_id,
    suffixAffixId: row.suffix_affix_id,
    armoryShelfPosition: row.armory_shelf_position,
    drachmaValue: row.drachma_value,
    metadataJson: row.metadata_json,
    generatedAt: row.generated_at,
    scrappedAt: row.scrapped_at,
    recoverableUntil: row.recoverable_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
