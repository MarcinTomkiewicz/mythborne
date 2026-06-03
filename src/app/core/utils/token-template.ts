export function replaceTemplateTokens(
  template: string,
  tokens: Readonly<Record<string, string | number>>,
): string {
  return Object.entries(tokens).reduce(
    (result, [token, value]) =>
      result.replace(new RegExp(`\\{${escapeRegExp(token)}\\}`, 'g'), String(value)),
    template,
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
