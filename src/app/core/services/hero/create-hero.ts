import { inject, Injectable } from '@angular/core';
import { concat, from, map, Observable, switchMap, toArray } from 'rxjs';
import { IHero } from '../../domain/hero/hero.model';
import { Insert } from '../../types/supabase.types';
import { AuthState } from '../auth/auth-state';
import { HeroFactory } from '../hero-factory/hero-factory';
import { SupabaseClientService } from '../supabase/supabase-client';
import { SupabaseService } from '../supabase/supabase';

@Injectable({ providedIn: 'root' })
export class CreateHero {
  private readonly authState = inject(AuthState);
  private readonly heroFactory = inject(HeroFactory);
  private readonly supabaseService = inject(SupabaseService);
  private readonly supabase = inject(SupabaseClientService).client;

  createHero(
    heroId: string,
    characterName: string,
    originId: string
  ): Observable<IHero> {
    const heroPayload: Insert<'hero'> = {
      id: heroId,
      name: characterName,
      level: 1,
      experience: 0,
      origin_id: originId,
      rank: 1,
      created_at: new Date().toISOString(),
      profile_picture: null,
    };

    const stats = this.heroFactory.createStats(heroId);
    const derived = this.heroFactory.createDerived(heroId);
    const resources = this.heroFactory.createResources(heroId);

    return from(this.supabase.from('hero').insert([heroPayload])).pipe(
      switchMap(({ error }) => {
        if (error) {
          throw error;
        }

        return concat(
          from(this.supabase.from('hero_stats').insert(stats)),
          from(this.supabase.from('hero_derived').insert([derived])),
          from(this.supabase.from('hero_resources').insert(resources))
        ).pipe(
          toArray(),
          map((results) => {
            const errors = results.map((result) => result.error).filter(Boolean);

            if (errors.length > 0) {
              throw errors[0];
            }

            const hero: IHero = {
              id: heroPayload.id,
              name: heroPayload.name,
              level: heroPayload.level ?? 1,
              rank: heroPayload.rank ?? 1,
              experience: heroPayload.experience ?? 0,
              originId: heroPayload.origin_id ?? null,
              estateId: heroPayload.estate_id ?? null,
              profilePicture: heroPayload.profile_picture ?? null,
              createdAt: heroPayload.created_at ?? null,
            };

            this.authState.setHero(hero);
            return hero;
          })
        );
      })
    );
  }

  assignFreeEstate(heroId: string): Observable<void> {
    const districtCode = 'A';
    const rank = 1;
    const maxAddresses = 5000;

    return this.supabaseService.getAll('estates', {
      filters: { district_code: districtCode, rank },
      select: 'id, address, hero_id',
    }).pipe(
      switchMap((estates) => {
        const existingMap = new Map<number, { id: string; hero_id: string | null }>();

        for (const estate of estates) {
          const match = estate.address?.match(/^A-(\d+)$/);

          if (match) {
            const number = parseInt(match[1], 10);
            existingMap.set(number, { id: estate.id, hero_id: estate.hero_id });
          }
        }

        const allNumbers = Array.from({ length: maxAddresses }, (_, index) => index + 1);
        const availableNumbers = allNumbers.filter((number) => {
          const entry = existingMap.get(number);
          return !entry || entry.hero_id === null;
        });

        if (availableNumbers.length === 0) {
          throw new Error(`No free addresses available in district ${districtCode}`);
        }

        const random = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        const address = `${districtCode}-${random}`;
        const existing = existingMap.get(random);

        if (existing && existing.hero_id === null) {
          return from(
            this.supabase.from('estates').update({ hero_id: heroId }).eq('id', existing.id)
          ).pipe(
            switchMap(({ error }) => {
              if (error) {
                throw error;
              }

              return this.linkEstateToHero(heroId, existing.id);
            })
          );
        }

        const estateId = crypto.randomUUID();

        return from(
          this.supabase
            .from('estates')
            .insert([
              {
                id: estateId,
                address,
                rank,
                hero_id: heroId,
                district_code: districtCode,
              },
            ])
        ).pipe(
          switchMap(({ error }) => {
            if (error) {
              throw error;
            }

            return this.supabaseService.getAll('buildings', {
              filters: { rank_required: rank },
              select: 'id',
            }).pipe(
              switchMap((buildings) => {
                const insertPayload = buildings.map((building) => ({
                  estate_id: estateId,
                  building_id: building.id,
                  level: 1,
                }));

                if (insertPayload.length === 0) {
                  return this.linkEstateToHero(heroId, estateId);
                }

                return from(this.supabase.from('estate_buildings').insert(insertPayload)).pipe(
                  switchMap(({ error: insertError }) => {
                    if (insertError) {
                      throw insertError;
                    }

                    return this.linkEstateToHero(heroId, estateId);
                  })
                );
              })
            );
          })
        );
      })
    );
  }

  private linkEstateToHero(heroId: string, estateId: string): Observable<void> {
    return from(
      this.supabase.from('hero').update({ estate_id: estateId }).eq('id', heroId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }

        const hero = this.authState.hero();

        if (hero?.id === heroId) {
          this.authState.setHero({
            ...hero,
            estateId,
          });
        }
      })
    );
  }
}
