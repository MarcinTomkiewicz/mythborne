import type { StatCardRow } from '../../types/stat-card.types';

export type CombatDisplayValueTone = 'danger' | 'golden' | 'info' | 'success' | 'muted';
export type CombatDisplayBadgeTone = 'success' | 'danger' | 'warn' | 'muted' | 'golden';
export type CombatSurfaceCenterState =
  'decision' | 'loading' | 'error' | 'live_manual' | 'report_result';
export type CombatSurfaceActionId = 'start-combat' | 'auto-resolve';

export interface CombatDisplayPortrait {
  src: string;
  alt: string;
}

export interface CombatDisplayParticipant {
  id: string;
  displayName: string;
  kindLabel: string | null;
  metaLabel: string | null;
  badgeLabel: string | null;
  badgeTone: CombatDisplayBadgeTone;
  avatarTone: 'heading' | 'danger' | 'success';
  portrait: CombatDisplayPortrait | null;
  hpCurrent: number | null;
  hpMax: number | null;
  healthLabel: string | null;
  baseStatsTitle: string | null;
  combatStatsTitle: string | null;
  emptyStatsTitle: string | null;
  baseStatRows: readonly StatCardRow[];
  combatStatRows: readonly StatCardRow[];
  emptyStatsMessage: string | null;
  side: string | null;
}

export interface CombatDisplayLogGroup {
  id: string;
  label: string | null;
  rows: CombatDisplayLogRow[];
}

export interface CombatDisplayLogRow {
  id: string;
  actorLabel: string;
  bodyPrefix: string;
  attackSourceLabel: string | null;
  bodySuffix: string;
  detailLines: string[];
  resultLabel: string | null;
  tone: CombatDisplayValueTone;
}

export interface CombatSurfaceAction {
  id: CombatSurfaceActionId;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  severity?: 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast' | null;
  text?: boolean;
  helperText?: string | null;
}

export interface CombatSurfaceTimingMeter {
  manifestId: string;
  position: number;
  zoneStart: number;
  zoneEnd: number;
  disabled: boolean;
  actionLabel: string | null;
  actionLoading: boolean;
  title: string | null;
  helperText: string | null;
  earlyLabel: string | null;
  hitZoneLabel: string | null;
  lateLabel: string | null;
}

export interface CombatTimingStrikeSnapshot {
  manifestId: string;
  positionPercent: number;
}

export interface CombatSurfaceDecisionDeadline {
  label: string;
  countdownLabel: string;
  progressPercent: number;
  isUpdating: boolean;
}

export interface CombatSurfaceCenterPanel {
  state: CombatSurfaceCenterState;
  contextLabel: string | null;
  title: string | null;
  helperText: string | null;
  detailText?: string | null;
  primaryAction?: CombatSurfaceAction | null;
  secondaryAction?: CombatSurfaceAction | null;
  footerAction?: CombatSurfaceAction | null;
  meter?: CombatSurfaceTimingMeter | null;
  decisionDeadline?: CombatSurfaceDecisionDeadline | null;
}
