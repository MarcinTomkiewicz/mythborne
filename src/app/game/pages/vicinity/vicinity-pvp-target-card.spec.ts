import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PvpTargetCandidate } from '../../../core/domain/pvp/pvp.model';
import { VicinityPvpTargetCard } from './vicinity-pvp-target-card';

describe('VicinityPvpTargetCard', () => {
  let fixture: ComponentFixture<VicinityPvpTargetCard>;
  let component: VicinityPvpTargetCard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VicinityPvpTargetCard],
    });

    fixture = TestBed.createComponent(VicinityPvpTargetCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('candidate', candidate());
  });

  it('disables attack and spy actions while a global PvP action is pending', () => {
    const attackSpy = jasmine.createSpy('startAttack');
    const spySpy = jasmine.createSpy('startSpy');
    component.startAttack.subscribe(attackSpy);
    component.startSpy.subscribe(spySpy);
    fixture.componentRef.setInput('actionPending', true);

    fixture.detectChanges();

    const buttons = actionButtons();

    expect(buttons.attack.disabled).toBeTrue();
    expect(buttons.spy.disabled).toBeTrue();

    buttons.attack.click();
    buttons.spy.click();

    expect(attackSpy).not.toHaveBeenCalled();
    expect(spySpy).not.toHaveBeenCalled();
  });

  function actionButtons(): { attack: HTMLButtonElement; spy: HTMLButtonElement } {
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const attack = buttons.find((button) =>
      button.textContent?.includes('Start attack'),
    );
    const spy = buttons.find((button) =>
      button.textContent?.includes('Start spy'),
    );

    if (!attack || !spy) {
      throw new Error('Expected attack and spy action buttons.');
    }

    return { attack, spy };
  }
});

function candidate(): PvpTargetCandidate {
  return {
    targetHeroId: 'target-1',
    targetDisplayName: 'Target Hero',
    targetLevel: 12,
    targetAddress: {
      estateId: 'estate-target',
      districtCode: 'B',
      address: 'B-120',
      addressNumber: 120,
      estateRank: 2,
    },
    distanceScore: 8,
    underProtection: false,
    protectionExpiresAt: null,
    attackEligibility: {
      canStart: true,
      blockReason: null,
      travelTimeSeconds: 180,
      minTargetLevel: 8,
      maxTargetLevel: 16,
      attackerHasBlockingActivity: false,
    },
    spyEligibility: {
      canStart: true,
      blockReason: null,
      travelTimeSeconds: 90,
    },
  };
}
