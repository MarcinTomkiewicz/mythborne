import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { StartFlowOriginOption } from '../../../../../core/domain/start-flow/start-flow.model';
import { StartFlow } from '../../../../../core/services/start-flow/start-flow';
import { StepOrigin } from './step-origin';

describe('StepOrigin', () => {
  let startFlow: jasmine.SpyObj<StartFlow>;

  beforeEach(() => {
    startFlow = jasmine.createSpyObj<StartFlow>('StartFlow', ['getOriginOptions']);

    TestBed.configureTestingModule({
      imports: [StepOrigin],
      providers: [
        { provide: StartFlow, useValue: startFlow },
      ],
    });
  });

  it('renders an empty state when the origin read model returns no options', () => {
    startFlow.getOriginOptions.and.returnValue(of([]));

    const fixture = createComponent();

    expect(textContent(fixture)).toContain(
      'Brak dostępnych pochodzeń dla tworzenia bohatera.',
    );
    expect(textContent(fixture)).not.toContain('Wczytywanie pochodzeń...');
  });

  it('renders the DB/RPC error when origin options fail to load', () => {
    startFlow.getOriginOptions.and.returnValue(
      throwError(() => new Error('Origin read model unavailable.')),
    );

    const fixture = createComponent();

    expect(textContent(fixture)).toContain('Origin read model unavailable.');
    expect(textContent(fixture)).not.toContain('Wczytywanie pochodzeń...');
  });

  it('shows DB-backed origin selection copy and creation summary', () => {
    startFlow.getOriginOptions.and.returnValue(of([originOption()]));

    const fixture = createComponent();

    expect(textContent(fixture)).toContain('Pochodzenie wybierasz raz');
    expect(textContent(fixture)).toContain('Nazwy, opisy i bonusy są częścią zasad wybranego świata');
    expect(textContent(fixture)).toContain('Podsumowanie tworzenia');
    expect(textContent(fixture)).toContain('1000');
  });

  function createComponent(): ComponentFixture<StepOrigin> {
    const fixture = TestBed.createComponent(StepOrigin);
    fixture.detectChanges();
    return fixture;
  }

  function textContent(fixture: ComponentFixture<StepOrigin>): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function originOption(): StartFlowOriginOption {
    return {
      id: 'origin-1',
      key: 'spartan',
      name: 'Spartanin',
      description: 'Disciplined hoplite.',
      imageUrl: '/images/origins/spartan.png',
      createdAt: null,
      originId: 'origin-1',
      originKey: 'spartan',
      originLabel: 'Spartanin',
      originDescription: 'Disciplined hoplite.',
      sortOrder: 1,
      isActive: true,
      bonusesJson: [],
      bonusSummaryText: '+5 Dexterity',
    };
  }
});
