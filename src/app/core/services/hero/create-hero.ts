import { inject, Injectable } from '@angular/core';
import { from, map, Observable, switchMap, concat, toArray } from 'rxjs';
import { Insert } from '../../types/supabase.types';
import { HeroFactory } from '../hero-factory/hero-factory';
import { SupabaseClientService } from '../supabase/supabase-client';
import { SupabaseService } from '../supabase/supabase';

@Injectable({ providedIn: 'root' })
export class CreateHero {
  private readonly heroFactory = inject(HeroFactory);
  private readonly supabaseService = inject(SupabaseService);
  private readonly supabase = inject(SupabaseClientService).client;

  createHero(
    heroId: string,
    characterName: string,
    originId: string
  ): Observable<void> {
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

    return concat(
      from(this.supabase.from('hero').insert([heroPayload])),
      from(this.supabase.from('hero_stats').insert(stats)),
      from(this.supabase.from('hero_derived').insert([derived])),
      from(this.supabase.from('hero_resources').insert(resources))
    ).pipe(
      toArray(),
      map((results) => {
        const errors = results.map((result) => result.error).filter(Boolean);

        if (errors.length > 0) {
          throw new Error('Failed to create hero and related records.');
        }
      })
    );
  }

  assignFreeEstate(heroId: string): Observable<void> {
    const districtCode = 'A';
    const rank = 1;
    const maxAddresses = 10000;

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
            map(({ error }) => {
              if (error) {
                throw error;
              }
            })
          );
        }

        return from(
          this.supabase
            .from('estates')
            .insert([
              {
                address,
                rank,
                hero_id: heroId,
                district_code: districtCode,
              },
            ])
            .select()
            .single()
        ).pipe(
          switchMap(({ data: estate, error }) => {
            if (error || !estate) {
              throw error ?? new Error('Failed to create estate');
            }

            return this.supabaseService.getAll('buildings', {
              filters: { rank_required: rank },
              select: 'id',
            }).pipe(
              switchMap((buildings) => {
                const insertPayload = buildings.map((building) => ({
                  estate_id: estate.id,
                  building_id: building.id,
                  level: 1,
                }));

                return from(
                  this.supabase.from('estate_buildings').insert(insertPayload)
                ).pipe(
                  map(({ error: insertError }) => {
                    if (insertError) {
                      throw insertError;
                    }
                  })
                );
              })
            );
          })
        );
      })
    );
  }
}
