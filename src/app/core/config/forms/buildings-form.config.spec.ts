import { createBuildingProgressionFields } from './buildings-form.config';

describe('buildings form config', () => {
  it('exposes current DB-backed progression fields in the admin editor', () => {
    const fields = createBuildingProgressionFields((key) => key);

    expect(fields.map((field) => field.controlName)).toEqual([
      'sortOrder',
      'startingLevel',
      'baseBuildTimeSeconds',
      'maxLevel',
    ]);
    expect(fields.map((field) => field.label)).toEqual([
      'sort_order',
      'starting_level',
      'base_build_time_seconds',
      'max_level',
    ]);
    expect(fields.find((field) => field.controlName === 'startingLevel'))
      .toEqual(jasmine.objectContaining({
        min: 0,
        step: 1,
      }));
  });
});
