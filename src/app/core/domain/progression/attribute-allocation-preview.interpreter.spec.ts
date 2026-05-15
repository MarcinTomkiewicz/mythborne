import { mapAttributeAllocationPreviewRows } from './attribute-allocation-preview.interpreter';
import {
  AttributeAllocationPreviewManifest,
  AttributeAllocationPreviewRow,
} from './attribute-allocation-preview-manifest.model';

describe('mapAttributeAllocationPreviewRows', () => {
  it('interprets future supported scalar rows from draft dependencies without row-key branches', () => {
    const manifest = manifestWithRows([
      row({
        key: 'evasion_chance',
        label: 'Evasion',
        currentDisplay: '10',
        currentValue: 10,
        descriptorKind: 'allocated_plus_context_delta',
        draftDependencies: ['agility'],
        draftDependencyScales: { agility: 2 },
      }),
    ]);

    const [result] = mapAttributeAllocationPreviewRows(
      manifest,
      { agility: 5 },
      { agility: 6 },
    );

    expect(result.currentDisplay).toBe('10');
    expect(result.draftDisplay).toBe('12');
    expect(result.deltaDisplay).toBe('(+2)');
    expect(result.tone).toBe('positive');
  });

  it('keeps unknown descriptor rows current-only', () => {
    const manifest = manifestWithRows([
      row({
        key: 'critical_chance',
        label: 'Critical chance',
        currentDisplay: '7',
        currentValue: 7,
        descriptorKind: 'future_descriptor_v1',
        draftDependencies: ['agility'],
        draftDependencyScales: { agility: 3 },
      }),
    ]);

    const [result] = mapAttributeAllocationPreviewRows(
      manifest,
      { agility: 5 },
      { agility: 6 },
    );

    expect(result.currentDisplay).toBe('7');
    expect(result.draftDisplay).toBeNull();
    expect(result.deltaDisplay).toBeNull();
    expect(result.tone).toBe('neutral');
  });
});

function manifestWithRows(rows: AttributeAllocationPreviewRow[]): AttributeAllocationPreviewManifest {
  return {
    contractVersion: 'hero_attribute_allocation_preview_manifest_v2',
    oneShotManifest: true,
    perClickRpcPreviewRequired: false,
    frontendMayEvaluateLocally: true,
    baseStatInputs: {
      agility: {
        currentAllocatedValue: 5,
        currentEffectiveValue: 5,
        additiveContextDelta: 0,
      },
    },
    rows,
  };
}

function row(config: {
  key: string;
  label: string;
  currentDisplay: string;
  currentValue: number;
  descriptorKind: string;
  draftDependencies: string[];
  draftDependencyScales: Record<string, number>;
}): AttributeAllocationPreviewRow {
  return {
    key: config.key,
    label: config.label,
    currentDisplay: config.currentDisplay,
    draftDisplay: null,
    deltaDisplay: null,
    tone: 'neutral',
    supported: true,
    currentValue: config.currentValue,
    currentMin: null,
    currentMax: null,
    currentStrength: null,
    strengthVariable: null,
    descriptor: {
      kind: config.descriptorKind,
      input: null,
      constant: 0,
      scale: 1,
      min: null,
      terms: [],
    },
    draftDependencies: config.draftDependencies,
    draftDependencyScales: config.draftDependencyScales,
  };
}
