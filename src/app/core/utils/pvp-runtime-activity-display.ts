import { HeroActiveRuntimeActivity } from '../domain/pvp/pvp.model';

export interface PvpRuntimeActivityFact {
  label: string;
  value: string;
}

export interface PvpRuntimeActivityDisplay {
  title: string;
  statusLabel: string;
  facts: PvpRuntimeActivityFact[];
}

export function isPvpRuntimeActivity(
  activity: HeroActiveRuntimeActivity | null,
): activity is HeroActiveRuntimeActivity {
  return activity?.activityKind === 'pvp_attack'
    || activity?.activityKind === 'pvp_spy';
}

export function pvpRuntimeActivityDisplay(
  activity: HeroActiveRuntimeActivity | null,
): PvpRuntimeActivityDisplay | null {
  if (!isPvpRuntimeActivity(activity)) {
    return null;
  }

  return {
    title: activity.activityKindLabel || pvpActivityKindLabel(activity.activityKind),
    statusLabel: activity.statusLabel || activity.status,
    facts: [
      { label: 'Status', value: activity.statusLabel || activity.status },
      { label: 'Started', value: dateTimeLabel(activity.startedAt) },
      activity.availableAt
        ? { label: 'Arrival', value: dateTimeLabel(activity.availableAt) }
        : null,
      activity.expiresAt
        ? { label: 'Deadline', value: dateTimeLabel(activity.expiresAt) }
        : null,
      activity.reason
        ? { label: 'Reason', value: activity.reason }
        : null,
    ].filter((fact): fact is PvpRuntimeActivityFact => fact !== null),
  };
}

function pvpActivityKindLabel(activityKind: string): string {
  if (activityKind === 'pvp_attack') {
    return 'PvP attack';
  }

  if (activityKind === 'pvp_spy') {
    return 'PvP spy';
  }

  return activityKind;
}

function dateTimeLabel(value: string): string {
  return new Date(value).toLocaleString();
}
