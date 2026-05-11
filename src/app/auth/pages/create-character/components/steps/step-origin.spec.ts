import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
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

  it('renders an empty state when the DB origin read model returns no options', () => {
    startFlow.getOriginOptions.and.returnValue(of([]));

    const fixture = createComponent();

    expect(textContent(fixture)).toContain(
      'No origin options are available for character creation.',
    );
    expect(textContent(fixture)).not.toContain('Loading origins...');
  });

  it('renders the DB/RPC error when origin options fail to load', () => {
    startFlow.getOriginOptions.and.returnValue(
      throwError(() => new Error('Origin read model unavailable.')),
    );

    const fixture = createComponent();

    expect(textContent(fixture)).toContain('Origin read model unavailable.');
    expect(textContent(fixture)).not.toContain('Loading origins...');
  });

  function createComponent(): ComponentFixture<StepOrigin> {
    const fixture = TestBed.createComponent(StepOrigin);
    fixture.detectChanges();
    return fixture;
  }

  function textContent(fixture: ComponentFixture<StepOrigin>): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }
});
