import {
  GameReportContextSection,
  GameReportItemReference,
  GameReportSectionFact,
  GameReportSectionItem,
} from './game-report.model';

export interface CombatReportRewardDisplay {
  segments: CombatReportRewardTextSegment[];
  hasRewards: boolean;
  hasExperience: boolean;
  hasCharacterPoints: boolean;
}

export interface CombatReportRewardTextSegment {
  text: string;
  isHighlighted: boolean;
}

export function mapCombatReportRewardDisplay(input: {
  rewardSection: GameReportContextSection | null;
  itemReferences: readonly GameReportItemReference[];
}): CombatReportRewardDisplay {
  const items = rewardEntries(input.rewardSection);
  const experience = firstAmountText(items, 'experience');
  const characterPoints = firstAmountText(items, 'character_points', 'hero_points');
  const resources = resourceRewardParts(items);
  const segments = rewardSegments({ experience, resources });

  return {
    segments,
    hasRewards: segments.length > 0 || input.itemReferences.length > 0,
    hasExperience: experience !== null,
    hasCharacterPoints: characterPoints !== null,
  };
}

function rewardEntries(
  rewardSection: GameReportContextSection | null,
): Array<GameReportSectionItem | GameReportSectionFact> {
  return [
    ...(rewardSection?.items ?? []),
    ...(rewardSection?.facts ?? []),
  ];
}

function rewardSegments(input: {
  experience: string | null;
  resources: string[];
}): CombatReportRewardTextSegment[] {
  if (input.experience && input.resources.length) {
    return [
      plain('Pokonujesz przeciwnika i zdobywasz '),
      highlighted(`${input.experience} doświadczenia`),
      plain(' oraz rabujesz zasoby obrońcy: '),
      ...joinHighlightedParts(input.resources),
      plain('.'),
    ];
  }

  if (input.experience) {
    return [
      plain('Zdobywasz '),
      highlighted(`${input.experience} doświadczenia`),
      plain('.'),
    ];
  }

  if (input.resources.length) {
    return [
      plain('Rabujesz zasoby obrońcy: '),
      ...joinHighlightedParts(input.resources),
      plain('.'),
    ];
  }

  return [];
}

function firstAmountText(
  items: ReadonlyArray<GameReportSectionItem | GameReportSectionFact>,
  ...entryKinds: string[]
): string | null {
  const entry = items.find((item) =>
    entryKinds.includes(normalizeKey('entryKind' in item ? item.entryKind : null)) ||
    entryKinds.includes(normalizeRewardLabel(item.label)),
  );

  return entry ? amountText(entry) : null;
}

function resourceRewardParts(
  items: ReadonlyArray<GameReportSectionItem | GameReportSectionFact>,
): string[] {
  return items
    .filter((item) =>
      ('entryKind' in item && normalizeKey(item.entryKind) === 'resource') ||
      ('resourceType' in item && Boolean(item.resourceType)),
    )
    .map((item) => {
      const amount = amountText(item);
      const label = 'resourceType' in item && item.resourceType
        ? resourceLabel(item.resourceType)
        : item.label;

      return amount ? `${amount} ${label}` : label;
    });
}

function amountText(item: GameReportSectionItem | GameReportSectionFact): string | null {
  if ('amount' in item && typeof item.amount === 'number' && Number.isFinite(item.amount)) {
    return stripPositiveSign(String(item.amount));
  }

  if (!item.value) {
    return null;
  }

  const numeric = item.value.match(/[+-]?\d+(?:[.,]\d+)?/);

  return stripPositiveSign(numeric?.[0] ?? item.value);
}

function stripPositiveSign(value: string): string {
  return value.startsWith('+') ? value.slice(1) : value;
}

function resourceLabel(value: string): string {
  switch (normalizeKey(value)) {
    case 'drachma':
      return 'Drachma';
    case 'materials':
    case 'material':
      return 'Materials';
    case 'workforce':
      return 'Workforce';
    default:
      return value;
  }
}

function normalizeRewardLabel(value: string): string {
  const normalized = normalizeKey(value);

  switch (normalized) {
    case 'xp':
    case 'exp':
    case 'experience':
    case 'doswiadczenie':
    case 'doświadczenie':
      return 'experience';
    case 'character_points':
    case 'hero_points':
    case 'punkty_postaci':
      return 'character_points';
    default:
      return normalized;
  }
}

function normalizeKey(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function joinHighlightedParts(parts: readonly string[]): CombatReportRewardTextSegment[] {
  return parts.flatMap((part, index) => [
    ...(index === 0 ? [] : [plain(index === parts.length - 1 ? ' i ' : ', ')]),
    highlighted(part),
  ]);
}

function plain(text: string): CombatReportRewardTextSegment {
  return {
    text,
    isHighlighted: false,
  };
}

function highlighted(text: string): CombatReportRewardTextSegment {
  return {
    text,
    isHighlighted: true,
  };
}
