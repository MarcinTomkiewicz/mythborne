export type AntiAbuseCaseTargetSearchEvent = { query: string };

export interface AntiAbuseCaseTargetSearchHandlers {
  setParticipantHeroId(heroId: string | null): void;
  setParticipantUserId(userId: string | null): void;
  setError(message: string): void;
}
