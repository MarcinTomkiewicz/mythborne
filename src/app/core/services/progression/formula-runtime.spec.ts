import { TestBed } from '@angular/core/testing';
import { FormulaRuntimeService } from './formula-runtime';

describe('FormulaRuntimeService', () => {
  let service: FormulaRuntimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormulaRuntimeService);
  });

  it('evaluates formulas with whitelisted helpers', () => {
    const result = service.evaluate('roundUp(4 + currentLevel * 2 + pow(currentLevel, 2), 5)', {
      currentLevel: 3,
    });

    expect(result.error).toBeNull();
    expect(result.value).toBe(20);
  });

  it('rejects unknown identifiers', () => {
    const result = service.evaluate('fetch(currentLevel)', { currentLevel: 3 });

    expect(result.value).toBeNull();
    expect(result.error).toContain('Unknown token');
  });

  it('evaluates random helpers and marks formulas as non-deterministic', () => {
    spyOn(Math, 'random').and.returnValue(0.25);

    const unit = service.evaluate('random()', {});
    const ranged = service.evaluate('random(10, 20)', {});

    expect(unit.error).toBeNull();
    expect(unit.value).toBe(0.25);
    expect(ranged.error).toBeNull();
    expect(ranged.value).toBe(12.5);
    expect(service.isNonDeterministic('round(random(1, 6))')).toBeTrue();
    expect(service.isNonDeterministic('round(currentLevel * 1.2)')).toBeFalse();
  });

  it('rejects unsupported random arity with a specific validation error', () => {
    const result = service.evaluate('random(10)', {});

    expect(result.value).toBeNull();
    expect(result.error).toBe(
      'random accepts either no arguments or exactly two arguments: random() or random(min, max).',
    );
  });

  it('humanizes random helper expressions', () => {
    expect(service.humanizeExpression('random()')).toBe('random decimal between 0 and 1');
    expect(service.humanizeExpression('round(random(10, 20))')).toBe(
      'round (random decimal between 10 and 20)',
    );
  });
});
