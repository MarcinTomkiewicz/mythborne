import {
  ReportMissingSection,
  ReportSpySection,
} from '../../../core/domain/reports/report.model';
import { ReportDetailSectionEntry } from '../../../core/domain/reports/report-section-display.model';

export function reportSpyEntries(
  section: ReportSpySection | ReportMissingSection | null,
): readonly ReportDetailSectionEntry[] {
  if (!section) {
    return [];
  }

  if ('missing' in section) {
    return [{
      key: 'spy-missing',
      title: section.title,
      description: section.message,
      chips: [section.sourceLabel],
      lines: [section.summary],
      rows: [],
    }];
  }

  return [
    {
      key: 'spy-summary',
      title: section.title,
      description: section.playerSummary,
      chips: [section.sourceLabel, section.outcomeLabel, section.spy.roleLabel],
      lines: section.narrativeLines,
      rows: [],
    },
    ...spyTargetEntries(section),
    ...section.baseStats.map((row) => ({
      key: `spy-base-stat-${row.key}`,
      title: row.statLabel,
      description: null,
      chips: [row.displayValue, row.baseDisplayValue, row.deltaDisplayValue],
      lines: [],
      rows: [],
    })),
    ...section.resources.map((row) => ({
      key: `spy-resource-${row.resourceType}`,
      title: row.resourceLabel,
      description: null,
      chips: [row.displayValue],
      lines: [],
      rows: [],
    })),
    ...section.equipment.map((row) => ({
      key: `spy-equipment-${row.displayName}`,
      title: row.displayName,
      description: null,
      chips: row.slotLabel ? [row.slotLabel] : [],
      lines: [],
      rows: [],
    })),
    ...section.buildings.map((row) => ({
      key: `spy-building-${row.displayValue}`,
      title: row.buildingName ?? row.displayValue,
      description: null,
      chips: [row.displayValue],
      lines: [],
      rows: [],
    })),
  ];
}

function spyTargetEntries(section: ReportSpySection): readonly ReportDetailSectionEntry[] {
  const title = section.target.displayName ?? section.target.address;
  return title
    ? [{
      key: 'spy-target',
      title,
      description: section.target.displayName ? section.target.address : null,
      chips: [],
      lines: [],
      rows: [],
    }]
    : [];
}
