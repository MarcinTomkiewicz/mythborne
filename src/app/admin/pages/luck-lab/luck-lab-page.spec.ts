import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LuckLabPage } from './luck-lab-page';
import { LuckLabPageState } from './luck-lab-page.state';

describe('LuckLabPage', () => {
  let fixture: ComponentFixture<LuckLabPage>;
  let pageState: Pick<
    LuckLabPageState,
    | 'form'
    | 'load'
    | 'isLoading'
    | 'error'
    | 'difficultyOptions'
    | 'districtOptions'
    | 'statOptions'
    | 'trialOptions'
    | 'lab'
  >;

  beforeEach(async () => {
    pageState = {
      form: new FormGroup({
        luckValue: new FormControl<number>(12, { nonNullable: true }),
        testedStatValue: new FormControl<number>(30, { nonNullable: true }),
        spiritualityValue: new FormControl<number>(4, { nonNullable: true }),
        difficultyKey: new FormControl<string | null>('easy'),
        districtCode: new FormControl<string | null>('district-a'),
        testedStatKey: new FormControl<string | null>('wisdom'),
        trialDefinitionId: new FormControl<string | null>('trial-1'),
      }),
      load: jasmine.createSpy('load'),
      isLoading: signal(false),
      error: signal(null),
      difficultyOptions: signal([{ label: 'Easy (easy)', value: 'easy' }]),
      districtOptions: signal([{ label: 'District A (district-a)', value: 'district-a' }]),
      statOptions: signal([{ label: 'Wisdom (wisdom)', value: 'wisdom' }]),
      trialOptions: signal([{ label: 'Maze (maze)', value: 'trial-1' }]),
      lab: {
        input: signal({
          luckValue: 12,
        }),
        result: signal({
          luckInfluence: { luckInfluence: 4 },
          trialPower: { trialPower: 34 },
        }),
      } as never,
    };

    await TestBed.configureTestingModule({
      imports: [LuckLabPage],
    })
      .overrideComponent(LuckLabPage, {
        set: {
          providers: [{ provide: LuckLabPageState, useValue: pageState }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LuckLabPage);
    fixture.detectChanges();
  });

  it('loads the page state on init', () => {
    expect(pageState.load).toHaveBeenCalled();
  });

  it('renders the Luck Lab shell and shared preview controls', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Luck balancing previews');
    expect(text).toContain('does not change configuration directly');
    expect(text).toContain('Luck value: 12');
    expect(text).toContain('Tested stat value: 30');
    expect(text).toContain('Spirituality value');
    expect(text).toContain('Difficulty');
    expect(text).toContain('District');
    expect(text).toContain('Trial definition');
    expect(fixture.debugElement.queryAll(By.css('p-slider')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('p-select')).length).toBe(4);
  });
});
