export function publicReportPathFromToken(
  publicToken: string | null | undefined,
): string | null {
  const token = publicToken?.trim();

  return token ? `/report/${token}` : null;
}

export function resolvePublicReportPath(input: {
  publicReportPath?: string | null;
  publicToken?: string | null;
}): string | null {
  const path = input.publicReportPath?.trim();

  return path || publicReportPathFromToken(input.publicToken);
}
