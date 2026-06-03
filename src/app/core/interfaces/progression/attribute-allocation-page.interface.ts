import { AttributeAllocationModelStatRow } from '../../domain/progression/attribute-allocation-preview-manifest.model';

export interface AttributePageContext {
  heroId: string;
  serverId: string;
}

export interface AttributePageContextResult {
  context: AttributePageContext | null;
  activeHeroHeroId: string | null;
  activeHeroServerId: string | null;
  selectedServerId: string | null;
  reasons: AttributePageContextFailureReason[];
}

export type AttributePageContextFailureReason =
  | 'missing_active_hero_id'
  | 'missing_active_hero_server_id'
  | 'missing_selected_server_id'
  | 'selected_server_mismatch';

export type AttributePageLoadDiagnostic =
  | {
      phase: 'context';
      activeHeroHeroId: string | null;
      activeHeroServerId: string | null;
      selectedServerId: string | null;
      reasons: AttributePageContextFailureReason[];
    }
  | {
      phase: 'rpc_or_mapper_error';
      requestHeroId: string;
      requestServerId: string;
      internalError: string;
    }
  | {
      phase: 'stale_response';
      requestHeroId: string;
      requestServerId: string;
      returnedHeroId: string;
      returnedServerId: string;
    };

export interface AttributePageStatRow extends AttributeAllocationModelStatRow {
  draftValue: number;
  pendingLevels: number;
  totalCost: number | null;
  nextIncreaseCost: number | null;
  displayNextCost: number | null;
}
