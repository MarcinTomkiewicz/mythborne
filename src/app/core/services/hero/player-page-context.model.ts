import { Origin } from '../../domain/origin/origin.model';
import { EquipmentPreviewSlotRow } from '../../domain/equipment/equipment-preview.model';
import { HeroDashboardRuntimeStatsReadModel } from '../../domain/hero/hero-dashboard-runtime-stats.model';
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
  estateSummary: JsonRecord | null;
  estateAddress: string | null;
  experience: PlayerDashboardExperienceContext;
  origin: Origin | null;
  runtimeStats: HeroDashboardRuntimeStatsReadModel;
  heroResources: HeroResourceRow[];
  equipmentPreviewRows: EquipmentPreviewSlotRow[];
  persistentStateRows: DashboardPersistentStateRow[];
}
