export interface ArmoryContextIdentity {
  serverId: string | null;
  heroId: string | null;
}

export function armoryContextKey(
  state: ArmoryContextIdentity | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
