export function combatAttackSourceDisplayLabel(label: string): string {
  const normalized = label.trim();

  return normalized.toLowerCase() === 'unarmed'
    ? 'Pięść'
    : normalized;
}
