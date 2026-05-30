export interface HomePageLoreBlock {
  readonly key: string;
  readonly text: string;
  readonly prominent?: boolean;
  readonly closing?: boolean;
}

export interface HomePageInfoCard {
  readonly key: string;
  readonly title: string;
  readonly body: string;
}
