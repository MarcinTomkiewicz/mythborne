import { TestBed } from '@angular/core/testing';
import { ItemGenerationQualityFormFactory } from './item-generation-quality-form.factory';

describe('ItemGenerationQualityFormFactory', () => {
  let factory: ItemGenerationQualityFormFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    factory = TestBed.inject(ItemGenerationQualityFormFactory);
  });

  it('round-trips quality value and requirement multipliers separately', () => {
    const form = factory.createEditorForm({
      id: 'quality-1',
      key: 'quality',
      label: 'Quality',
      multiplier: 1.5,
      requirementMultiplier: 1.25,
      weight: 25,
      sortOrder: 20,
      isEnabled: true,
    });

    form.controls.multiplier.setValue(1.75);
    form.controls.requirementMultiplier.setValue(1.35);

    expect(factory.toDraft(form)).toEqual(jasmine.objectContaining({
      multiplier: 1.75,
      requirementMultiplier: 1.35,
    }));
  });
});
