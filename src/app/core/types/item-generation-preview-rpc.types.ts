import { Database } from './database.types';

type GetItemQualityImpactPreviewFunction =
  Database['public']['Functions']['get_item_quality_impact_preview'];

export type GetItemQualityImpactPreviewRpcArgs =
  GetItemQualityImpactPreviewFunction['Args'];

export type ItemQualityImpactPreviewRpcRow =
  GetItemQualityImpactPreviewFunction['Returns'][number];
