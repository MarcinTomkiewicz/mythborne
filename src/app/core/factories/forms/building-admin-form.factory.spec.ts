import { TestBed } from '@angular/core/testing';
import { BuildingAdminData } from '../../domain/building/building.model';
import { BuildingAdminFormFactory } from './building-admin-form.factory';

describe('BuildingAdminFormFactory', () => {
  let factory: BuildingAdminFormFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BuildingAdminFormFactory],
    });
    factory = TestBed.inject(BuildingAdminFormFactory);
  });

  it('creates new building drafts with current progression fields', () => {
    const draft = factory.createDraft(adminData());

    expect(draft.startingLevel).toBe(0);
    expect(draft.baseBuildTimeSeconds).toBe(60);
    expect(draft.maxLevel).toBe(0);
  });

  it('round-trips starting level through the editor form', () => {
    const form = factory.createEditorForm();
    const draft = factory.createDraft(adminData());

    factory.patchEditor(form, {
      ...draft,
      id: 'building-1',
      key: 'market',
      name: 'Market',
      startingLevel: 3,
      baseBuildTimeSeconds: 120,
      maxLevel: 15,
    });

    expect(form.controls.startingLevel.value).toBe(3);
    expect(factory.toDraft(form)).toEqual(jasmine.objectContaining({
      id: 'building-1',
      startingLevel: 3,
      baseBuildTimeSeconds: 120,
      maxLevel: 15,
    }));
  });

  it('allows starting level 0 as an explicitly unbuilt definition state', () => {
    const form = factory.createEditorForm();

    form.controls.startingLevel.setValue(0);
    expect(form.controls.startingLevel.valid).toBeTrue();
    expect(factory.toDraft(form).startingLevel).toBe(0);
  });
});

function adminData(): BuildingAdminData {
  return {
    buildings: [],
    bonusTemplates: [],
    bonusTemplateMetadata: [],
    districts: [{ code: 'A', name: 'District A', description: 'A', rank: 1 }],
    stats: [],
    uiMetadataEntries: [],
  };
}
