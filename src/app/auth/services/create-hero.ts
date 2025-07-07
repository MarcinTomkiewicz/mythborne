import { inject, Injectable } from '@angular/core';
import {
  from,
  forkJoin,
  map,
  switchMap,
  Observable,
  concat,
  toArray,
} from 'rxjs';
import { HeroFactory } from '../../core/services/hero-factory/hero-factory';
import { SupabaseService } from '../../core/services/supabase/supabase';
import { Insert } from '../../core/types/supabase.types';
import { supabase } from '../../core/supabase/supabase';

@Injectable({ providedIn: 'root' })
export class createHero {
  private heroFactory = inject(HeroFactory);
  private supabaseService = inject(SupabaseService);

  createHero(
    heroId: string,
    characterName: string,
    originId: string
  ): Observable<void> {
    const heroPayload: Insert<'hero'> = {
      id: heroId,
      name: characterName,
      level: 1,
      experience: 0, // ✅ zgodnie z Twoją definicją
      origin_id: originId,
      rank: 1,
      created_at: new Date().toISOString(),
      profile_picture: null,
    };

    const stats = this.heroFactory.createStats(heroId);
    const derived = this.heroFactory.createDerived(heroId);
    const resources = this.heroFactory.createResources(heroId);

    console.log('[HeroService] 🛡 Creating hero with payload:', heroPayload);
    console.log('[HeroService] 📊 Stats:', stats);
    console.log('[HeroService] 📈 Derived:', derived);
    console.log('[HeroService] 💰 Resources:', resources);

    return concat(
      from(supabase.from('hero').insert([heroPayload])),
      from(supabase.from('hero_stats').insert(stats)),
      from(supabase.from('hero_derived').insert([derived])),
      from(supabase.from('hero_resources').insert(resources))
    ).pipe(
      toArray(),
      map((results) => {
        const errors = results.map((res) => res.error).filter(Boolean);
        if (errors.length > 0) {
          console.error(
            '[HeroService] ❌ Error(s) during hero creation:',
            errors
          );
          throw new Error('Failed to create hero and related records.');
        }
        console.log('[HeroService] ✅ Hero and related records created');
      })
    );
  }

assignFreeEstate(heroId: string): Observable<void> {
  const districtCode = 'A';
  const rank = 1;
  const maxAddresses = 10000;

  return this.supabaseService.getAll('estates', {
    filters: { district_code: districtCode, rank },
    select: 'id, address, hero_id'
  }).pipe(
    switchMap((estates) => {
      const existingMap = new Map<number, { id: string, hero_id: string | null }>();

      for (const estate of estates) {
        const match = estate.address?.match(/^A-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          existingMap.set(num, { id: estate.id, hero_id: estate.hero_id });
        }
      }

      const allNumbers = Array.from({ length: maxAddresses }, (_, i) => i + 1);
      const availableNumbers = allNumbers.filter((n) => {
        const entry = existingMap.get(n);
        return !entry || entry.hero_id === null;
      });

      if (availableNumbers.length === 0) {
        throw new Error(`No free addresses available in district ${districtCode}`);
      }

      const random = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
      const address = `${districtCode}-${random}`;
      const existing = existingMap.get(random);

      // Reuse
      if (existing && existing.hero_id === null) {
        return from(
          supabase.from('estates').update({ hero_id: heroId }).eq('id', existing.id)
        ).pipe(
          map(({ error }) => {
            if (error) throw error;
            console.log('[assignFreeEstate] 🏡 Reused estate:', address);
          })
        );
      }

      // Create new estate
      return from(
        supabase.from('estates').insert([{
          address,
          rank,
          hero_id: heroId,
          district_code: districtCode
        }]).select().single()
      ).pipe(
        switchMap(({ data: estate, error }) => {
          if (error || !estate) throw error ?? new Error('Failed to create estate');

          console.log('[assignFreeEstate] 🏗️ Created estate:', estate.address);

          // Get buildings for this rank
          return this.supabaseService.getAll('buildings', {
            filters: { rank_required: rank },
            select: 'id'
          }).pipe(
            switchMap((buildings) => {
              const insertPayload = buildings.map((b) => ({
                estate_id: estate.id,
                building_id: b.id,
                level: 1
              }));

              return from(
                supabase.from('estate_buildings').insert(insertPayload)
              ).pipe(
                map(({ error }) => {
                  if (error) throw error;
                  console.log('[assignFreeEstate] 🏠 Buildings initialized');
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
