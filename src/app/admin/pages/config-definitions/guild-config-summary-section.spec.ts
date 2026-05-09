import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { GuildConfigSummary } from '../../../core/domain/guild/guild.model';
import { PlayerGuild } from '../../../core/services/guild/player-guild';
import { GuildConfigSummarySection } from './guild-config-summary-section';

describe('GuildConfigSummarySection', () => {
  let fixture: ComponentFixture<GuildConfigSummarySection>;
  let playerGuild: jasmine.SpyObj<PlayerGuild>;

  beforeEach(async () => {
    playerGuild = jasmine.createSpyObj<PlayerGuild>('PlayerGuild', [
      'getGuildConfigSummary',
    ]);
    playerGuild.getGuildConfigSummary.and.returnValue(of(config()));

    await TestBed.configureTestingModule({
      imports: [GuildConfigSummarySection],
      providers: [
        { provide: PlayerGuild, useValue: playerGuild },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GuildConfigSummarySection);
  });

  it('renders DB-backed guild config summary values', () => {
    fixture.detectChanges();
    const text = textContent(fixture);

    expect(playerGuild.getGuildConfigSummary).toHaveBeenCalled();
    expect(text).toContain('Guild configuration summary');
    expect(text).toContain('1000 drachmas');
    expect(text).toContain('10 + leader level x 2');
    expect(text).toContain('15 days');
    expect(text).toContain('360 minutes');
    expect(text).toContain('720 minutes');
    expect(text).toContain('3');
    expect(text).toContain('30');
  });

  it('displays zero guild armory capacity as unlimited', () => {
    playerGuild.getGuildConfigSummary.and.returnValue(of(config({
      armoryCapacity: 0,
      armoryCapacityIsUnlimited: true,
    })));

    fixture.detectChanges();

    expect(textContent(fixture)).toContain('Unlimited');
  });

  it('surfaces guild config read errors inline', () => {
    playerGuild.getGuildConfigSummary.and.returnValue(
      throwError(() => new Error('Guild config unavailable.')),
    );

    fixture.detectChanges();

    expect(textContent(fixture)).toContain('Guild config unavailable.');
  });
});

function textContent(fixture: ComponentFixture<GuildConfigSummarySection>): string {
  return fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();
}

function config(overrides: Partial<GuildConfigSummary> = {}): GuildConfigSummary {
  return {
    creationDrachmaCost: 1000,
    memberBaseLimit: 10,
    memberLimitPerLeaderLevel: 2,
    leaderInactivityThresholdDays: 15,
    nominationDurationMinutes: 360,
    votingDurationMinutes: 720,
    emergencyMaxCandidates: 3,
    armoryCapacity: 30,
    armoryCapacityIsUnlimited: false,
    ...overrides,
  };
}
