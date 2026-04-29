import { Database } from './database.types';

type GetBuildingProgressionPreviewFunction =
  Database['public']['Functions']['get_building_progression_preview'];

export type GetBuildingProgressionPreviewRpcArgs =
  GetBuildingProgressionPreviewFunction['Args'];
export type BuildingProgressionPreviewRpcRow =
  GetBuildingProgressionPreviewFunction['Returns'][number];
