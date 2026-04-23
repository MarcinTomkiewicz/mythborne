import {
  BuildingResourceType,
  BuildingStatOption,
  EditableBuildingRequirement,
} from '../domain/building/building.model';

export function toBuildingBonusLabel(target: string): string {
  return target
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (value) => value.toUpperCase());
}

export function toBuildingBonusValue(value: number, type: 'flat' | 'percent'): string {
  return type === 'percent' ? `${value}%` : `${value}`;
}

export function toBuildingDurationLabel(minutes: number | null): string {
  if (minutes === null) {
    return 'Unavailable';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

export function toBuildingRequirementTypeLabel(
  type: EditableBuildingRequirement['type']
): string {
  if (type === 'hero_rank') {
    return 'Hero rank';
  }

  if (type === 'hero_stat') {
    return 'Hero stat';
  }

  return 'Hero level';
}

export function toBuildingRequirementSummary(
  requirement: EditableBuildingRequirement,
  stats: BuildingStatOption[]
): string {
  if (requirement.type === 'hero_stat') {
    const statLabel =
      stats.find((stat) => stat.key === requirement.statKey)?.label ??
      requirement.statKey ??
      'Stat';

    return `${statLabel} ${requirement.minValue}`;
  }

  return `${toBuildingRequirementTypeLabel(requirement.type)} ${requirement.minValue}`;
}

export function toResourceLabel(type: BuildingResourceType): string {
  if (type === 'materials') {
    return 'Materials';
  }

  if (type === 'workforce') {
    return 'Workforce';
  }

  return 'Drachma';
}

export function resourceOrder(type: BuildingResourceType): number {
  if (type === 'drachma') {
    return 0;
  }

  if (type === 'materials') {
    return 1;
  }

  return 2;
}
