import { Database } from './database.types';

type Functions = Database['public']['Functions'];

export type GetBonusImpactPreviewRpcArgs =
  Functions['get_bonus_impact_preview']['Args'];
export type BonusImpactPreviewRpcRow =
  Functions['get_bonus_impact_preview']['Returns'][number];
