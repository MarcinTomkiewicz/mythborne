export function formatCombatLogResultLabel(value: string): string {
  return value.replace(/\d+\.\d+/g, (match) =>
    match.replace(/0+$/, '').replace(/\.$/, ''),
  );
}
