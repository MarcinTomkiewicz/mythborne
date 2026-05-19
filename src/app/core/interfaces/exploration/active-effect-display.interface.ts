export interface ExplorationActiveEffectDisplay {
  title: string;
  summary: string;
  warning: string | null;
  facts: Array<{ label: string; value: string }>;
}
