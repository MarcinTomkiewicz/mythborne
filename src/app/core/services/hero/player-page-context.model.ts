import { Origin } from '../../domain/origin/origin.model';
import {
  EquipmentPreviewCopy,
  EquipmentPreviewSlotRow,
} from '../../domain/equipment/equipment-preview.model';
import { HeroDashboardRuntimeStatsReadModel } from '../../domain/hero/hero-dashboard-runtime-stats.model';
import {
  AttributeAllocationModel,
  AttributeAllocationPreviewManifest,
} from '../../domain/progression/attribute-allocation-preview-manifest.model';
import { BaseStatSnapshot } from '../../domain/stats/base-stat.model';
import { HeroResourceRow } from '../../types/resource-display.types';
import { JsonRecord } from '../../utils/json-read';
import { DashboardPersistentStateRow } from './dashboard-persistent-state.model';

export interface PlayerDashboardExperienceContext {
  level: number;
  currentExperience: number;
  experienceToNextLevel: number;
  totalExperienceEarned: number;
  experienceProgressPercent: number;
  isAvailable: boolean;
  unavailableReason: string | null;
}

export interface PlayerDashboardPageContext {
  heroId: string;
  serverId: string;
  heroName: string;
  heroLevel: number;
  characterPoints: number;
  copyJson: PlayerDashboardCopyJson;
  estateSummary: JsonRecord | null;
  estateAddress: string | null;
  experience: PlayerDashboardExperienceContext;
  origin: Origin | null;
  runtimeStats: HeroDashboardRuntimeStatsReadModel;
  heroResources: HeroResourceRow[];
  equipmentPreviewRows: EquipmentPreviewSlotRow[];
  persistentStateRows: DashboardPersistentStateRow[];
}

export interface PlayerDashboardCopyJson {
  equipmentPreview: EquipmentPreviewCopy;
}

export interface PlayerAttributesPageContext {
  heroId: string;
  serverId: string;
  heroName: string;
  heroLevel: number;
  availableCharacterPoints: number;
  baseStats: BaseStatSnapshot[];
  draftStats: Record<string, number>;
  previewManifest: AttributeAllocationPreviewManifest;
  allocationModel: AttributeAllocationModel;
  runtimeDerivedStats: JsonRecord | null;
}
