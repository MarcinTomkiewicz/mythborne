import { TestBed } from '@angular/core/testing';
import { FormulaRuntimeService } from './formula-runtime';

describe('FormulaRuntimeService', () => {
  let service: FormulaRuntimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormulaRuntimeService);
  });

  it('evaluates formulas with whitelisted helpers', () => {
    const result = service.evaluate('roundUp(4 + level * 2 + pow(level, 2), 5)', {
      level: 3,
    });

    expect(result.error).toBeNull();
    expect(result.value).toBe(20);
  });

  it('rejects unknown identifiers', () => {
    const result = service.evaluate('fetch(level)', { level: 3 });

    expect(result.value).toBeNull();
    expect(result.error).toContain('Unknown token');
  });
});
