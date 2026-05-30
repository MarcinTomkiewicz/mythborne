import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthState } from './auth-state';
import { Auth } from './auth';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { Platform } from '../platform/platform';
import { SupabaseClientService } from '../supabase/supabase-client';

describe('Auth', () => {
  let service: Auth;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let getSession: jasmine.Spy;

  beforeEach(() => {
    getSession = jasmine.createSpy('getSession');
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', [
      'clear',
      'loadActiveHero',
    ]);

    TestBed.configureTestingModule({
      providers: [
        AuthState,
        { provide: Backend, useValue: jasmine.createSpyObj<Backend>('Backend', ['upsert']) },
        {
          provide: ActiveHero,
          useValue: activeHero,
        },
        {
          provide: Platform,
          useValue: {
            isBrowser: true,
            isServer: false,
          },
        },
        {
          provide: SupabaseClientService,
          useValue: {
            client: {
              auth: {
                getSession,
                onAuthStateChange: jasmine.createSpy('onAuthStateChange'),
              },
            },
          },
        },
      ],
    });
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('shares in-flight initialization without loading hero rows during auth restore', async () => {
    const user = { id: 'user-1', email: 'hero@example.com' };
    let resolveSession: (value: unknown) => void = () => undefined;
    getSession.and.returnValue(new Promise((resolve) => {
      resolveSession = resolve;
    }));

    const firstInitialize = firstValueFrom(service.initialize());
    const secondInitialize = firstValueFrom(service.initialize());

    expect(getSession).toHaveBeenCalledTimes(1);

    resolveSession({
      data: { session: { user } },
      error: null,
    });

    await Promise.all([firstInitialize, secondInitialize]);

    expect(activeHero.loadActiveHero).not.toHaveBeenCalled();
  });
});
