import {
  ReportSpyBaseStatRow,
  ReportSpyBuildingRow,
  ReportSpyEquipmentRow,
  ReportSpyResourceRow,
  ReportSpyRevealedSections,
  ReportSpySection,
} from '../domain/reports/report.model';
import {
  JsonRecord,
  optionalNullableText,
  read,
  requiredArray,
  requiredBoolean,
  requiredNullableNumber,
  requiredNullableText,
  requiredNumber,
  requiredRecord,
  requiredText,
  requiredTextArray,
  requireLiteral,
} from './json-read';

export function mapSpySection(record: JsonRecord, field: string): ReportSpySection {
  const revealedSections = mapSpyRevealedSections(
    requiredRecord(read(record, 'revealedSections'), `${field}.revealedSections`),
    `${field}.revealedSections`,
  );

  return {
    sectionKind: requireLiteral(
      requiredText(read(record, 'sectionKind'), `${field}.sectionKind`),
      'pvp_spy',
      `${field}.sectionKind`,
    ),
    sourceLabel: requiredText(read(record, 'sourceLabel'), `${field}.sourceLabel`),
    title: requiredText(read(record, 'title'), `${field}.title`),
    summary: requiredText(read(record, 'summary'), `${field}.summary`),
    outcomeKey: requiredText(read(record, 'outcomeKey'), `${field}.outcomeKey`),
    success: requiredBoolean(read(record, 'success'), `${field}.success`),
    detected: requiredBoolean(read(record, 'detected'), `${field}.detected`),
    outcomeLabel: requiredText(read(record, 'outcomeLabel'), `${field}.outcomeLabel`),
    playerSummary: requiredText(read(record, 'playerSummary'), `${field}.playerSummary`),
    visibilityKey: requiredNullableText(read(record, 'visibilityKey'), `${field}.visibilityKey`),
    publicRedacted: requiredBoolean(read(record, 'publicRedacted'), `${field}.publicRedacted`),
    viewerRole: requiredText(read(record, 'viewerRole'), `${field}.viewerRole`),
    spy: mapSpyActor(requiredRecord(read(record, 'spy'), `${field}.spy`), `${field}.spy`),
    target: mapSpyTarget(requiredRecord(read(record, 'target'), `${field}.target`), `${field}.target`),
    revealedSections,
    baseStats: revealedSections.baseStats
      ? requiredArray(read(record, 'baseStats'), `${field}.baseStats`)
        .map((row, index) => mapSpyBaseStat(row, `${field}.baseStats[${index}]`))
      : [],
    resources: revealedSections.resources
      ? requiredArray(read(record, 'resources'), `${field}.resources`)
        .map((row, index) => mapSpyResource(row, `${field}.resources[${index}]`))
      : [],
    buildings: revealedSections.buildings
      ? requiredArray(read(record, 'buildings'), `${field}.buildings`)
        .map((row, index) => mapSpyBuilding(row, `${field}.buildings[${index}]`))
      : [],
    equipment: revealedSections.equipment
      ? requiredArray(read(record, 'equipment'), `${field}.equipment`)
        .map((row, index) => mapSpyEquipment(row, `${field}.equipment[${index}]`))
      : [],
    narrativeLines: requiredTextArray(read(record, 'narrativeLines'), `${field}.narrativeLines`),
  };
}

function mapSpyActor(row: JsonRecord, field: string): ReportSpySection['spy'] {
  return {
    level: requiredNullableNumber(read(row, 'level'), `${field}.level`),
    roleLabel: requiredText(read(row, 'roleLabel'), `${field}.roleLabel`),
  };
}

function mapSpyTarget(row: JsonRecord, field: string): ReportSpySection['target'] {
  return {
    displayName: requiredNullableText(read(row, 'displayName'), `${field}.displayName`),
    level: requiredNullableNumber(read(row, 'level'), `${field}.level`),
    districtCode: requiredNullableText(read(row, 'districtCode'), `${field}.districtCode`),
    addressNumber: requiredNullableNumber(read(row, 'addressNumber'), `${field}.addressNumber`),
    address: requiredNullableText(read(row, 'address'), `${field}.address`),
  };
}

function mapSpyRevealedSections(row: JsonRecord, field: string): ReportSpyRevealedSections {
  return {
    baseStats: requiredBoolean(read(row, 'baseStats'), `${field}.baseStats`),
    combatStats: requiredBoolean(read(row, 'combatStats'), `${field}.combatStats`),
    resources: requiredBoolean(read(row, 'resources'), `${field}.resources`),
    estate: requiredBoolean(read(row, 'estate'), `${field}.estate`),
    buildings: requiredBoolean(read(row, 'buildings'), `${field}.buildings`),
    equipment: requiredBoolean(read(row, 'equipment'), `${field}.equipment`),
  };
}

function mapSpyBaseStat(row: JsonRecord, field: string): ReportSpyBaseStatRow {
  return {
    key: requiredText(read(row, 'key'), `${field}.key`),
    kind: requireLiteral(requiredText(read(row, 'kind'), `${field}.kind`), 'base_stat', `${field}.kind`),
    statKey: requiredText(read(row, 'statKey'), `${field}.statKey`),
    label: requiredText(read(row, 'label'), `${field}.label`),
    statLabel: requiredText(read(row, 'statLabel'), `${field}.statLabel`),
    value: requiredNumber(read(row, 'value'), `${field}.value`),
    finalValue: requiredNumber(read(row, 'finalValue'), `${field}.finalValue`),
    baseValue: requiredNumber(read(row, 'baseValue'), `${field}.baseValue`),
    delta: requiredNumber(read(row, 'delta'), `${field}.delta`),
    tone: requiredText(read(row, 'tone'), `${field}.tone`),
    colorTone: requiredText(read(row, 'colorTone'), `${field}.colorTone`),
    displayValue: requiredText(read(row, 'displayValue'), `${field}.displayValue`),
    baseDisplayValue: requiredText(read(row, 'baseDisplayValue'), `${field}.baseDisplayValue`),
    deltaDisplayValue: requiredText(read(row, 'deltaDisplayValue'), `${field}.deltaDisplayValue`),
    colorableFinalValue: requiredBoolean(read(row, 'colorableFinalValue'), `${field}.colorableFinalValue`),
    sortOrder: requiredNumber(read(row, 'sortOrder'), `${field}.sortOrder`),
  };
}

function mapSpyResource(row: JsonRecord, field: string): ReportSpyResourceRow {
  return {
    resourceType: requiredText(read(row, 'resourceType'), `${field}.resourceType`),
    resourceLabel: requiredText(read(row, 'resourceLabel'), `${field}.resourceLabel`),
    amount: requiredNumber(read(row, 'amount'), `${field}.amount`),
    displayValue: requiredText(read(row, 'displayValue'), `${field}.displayValue`),
  };
}

function mapSpyEquipment(row: JsonRecord, field: string): ReportSpyEquipmentRow {
  return {
    slotKey: requiredNullableText(read(row, 'slotKey'), `${field}.slotKey`),
    slotLabel: requiredNullableText(read(row, 'slotLabel'), `${field}.slotLabel`),
    equipmentArea: requiredNullableText(read(row, 'equipmentArea'), `${field}.equipmentArea`),
    displayName: requiredText(read(row, 'displayName'), `${field}.displayName`),
    qualityKey: optionalNullableText(read(row, 'qualityKey'), `${field}.qualityKey`),
  };
}

function mapSpyBuilding(row: JsonRecord, field: string): ReportSpyBuildingRow {
  return {
    buildingKey: requiredNullableText(read(row, 'buildingKey'), `${field}.buildingKey`),
    buildingName: requiredNullableText(read(row, 'buildingName'), `${field}.buildingName`),
    districtCode: requiredNullableText(read(row, 'districtCode'), `${field}.districtCode`),
    level: requiredNullableNumber(read(row, 'level'), `${field}.level`),
    displayValue: requiredText(read(row, 'displayValue'), `${field}.displayValue`),
  };
}
