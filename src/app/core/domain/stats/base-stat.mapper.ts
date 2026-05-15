import { IStat } from '../../interfaces/i-stats/i-stats';
import { nonNegativeInteger } from '../../utils/number';
import { BaseStatSnapshot } from './base-stat.model';

export function mapBaseStatSnapshots(
  definitions: readonly IStat[],
  values: Readonly<Record<string, number>>,
): BaseStatSnapshot[] {
  return definitions
    .slice()
    .sort((first, second) => first.order - second.order)
    .map((stat) => ({
      key: stat.key,
      label: stat.label,
      description: stat.description,
      order: stat.order,
      currentValue: nonNegativeInteger(values[stat.key] ?? 0),
    }));
}
