import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GuildConfigSummary } from '../../../core/domain/guild/guild.model';
import { ConfigChangeSets } from '../../../core/services/config/config-change-sets';
import { ConfigChangeSetWorkflow } from '../../../core/services/config/config-change-set-workflow';
import { ConfigDefinitions } from '../../../core/services/config/config-definitions';
import { ConfigValues } from '../../../core/services/config/config-values';
import { PlayerGuild } from '../../../core/services/guild/player-guild';
import { ToastService } from '../../../core/services/ui/toast';
import { guildConfigDefinitions } from './guild-config-editor.state.spec-fixtures';
import { GuildConfigSummarySection } from './guild-config-summary-section';

describe('GuildConfigSummarySection', () => {
  let fixture: ComponentFixture<GuildConfigSummarySection>;
  let changeSets: jasmine.SpyObj<ConfigChangeSets>;
  let configDefinitions: jasmine.SpyObj<ConfigDefinitions>;
  let configValues: jasmine.SpyObj<ConfigValues>;
  let playerGuild: jasmine.SpyObj<PlayerGuild>;
  let toast: jasmine.SpyObj<ToastService>;
  let workflow: jasmine.SpyObj<ConfigChangeSetWorkflow>;

  beforeEach(async () => {
    changeSets = jasmine.createSpyObj<ConfigChangeSets>('ConfigChangeSets', [
      'createDraftChangeSet',
      'createConfigValueChangeEntry',
    ]);
    configDefinitions = jasmine.createSpyObj<ConfigDefinitions>(
      'ConfigDefinitions',
      ['getActiveDefinitionsByManagedEntityKey'],
    );
    configValues = jasmine.createSpyObj<ConfigValues>('ConfigValues', [
      'getEffectiveValues',
    ]);
    playerGuild = jasmine.createSpyObj<PlayerGuild>('PlayerGuild', [
      'getGuildConfigSummary',
    ]);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);
    workflow = jasmine.createSpyObj<ConfigChangeSetWorkflow>(
      'ConfigChangeSetWorkflow',
      ['markReady', 'apply'],
    );

    configDefinitions.getActiveDefinitionsByManagedEntityKey.and.returnValue(
      of(guildConfigDefinitions()),
    );
    configValues.getEffectiveValues.and.returnValue(of(new Map()));
    playerGuild.getGuildConfigSummary.and.returnValue(of(config()));

    await TestBed.configureTestingModule({
      imports: [GuildConfigSummarySection],
      providers: [
        provideRouter([]),
        { provide: ConfigChangeSets, useValue: changeSets },
        { provide: ConfigChangeSetWorkflow, useValue: workflow },
        { provide: ConfigDefinitions, useValue: configDefinitions },
        { provide: ConfigValues, useValue: configValues },
        { provide: PlayerGuild, useValue: playerGuild },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GuildConfigSummarySection);
  });

  it('renders DB-backed guild config summary values and editable form', () => {
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
    expect(text).toContain('Edit guild configuration');
    expect(text).toContain('Apply guild config changes');
    expect(text).toContain('Use 0 to make guild armory capacity unlimited.');
    expect(text).toContain('0 means unlimited.');
  });

  it('displays zero guild armory capacity as unlimited', () => {
    playerGuild.getGuildConfigSummary.and.returnValue(of(config({
      armoryCapacity: 0,
      armoryCapacityIsUnlimited: true,
    })));

    fixture.detectChanges();

    expect(textContent(fixture)).toContain('Unlimited');
  });

  it('uses only managed entity query params for secondary advanced change-set link', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance.governanceQueryParams()).toEqual({
      managedEntityKey: 'guild',
    });
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
