import {
  HeroExplorationMovementOptionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';

export type ExplorationDirectionGateSlot =
  | 'forward'
  | 'left'
  | 'right'
  | 'back'
  | 'unknown';

export interface ExplorationDirectionBoardLayout {
  forward: HeroExplorationMovementOptionReadModel[];
  left: HeroExplorationMovementOptionReadModel[];
  right: HeroExplorationMovementOptionReadModel[];
  back: HeroExplorationMovementOptionReadModel[];
  unsupported: HeroExplorationMovementOptionReadModel[];
  openPathCount: number;
  hasBackPath: boolean;
}

export function buildExplorationDirectionBoardLayout(
  options: readonly HeroExplorationMovementOptionReadModel[],
): ExplorationDirectionBoardLayout {
  const layout: ExplorationDirectionBoardLayout = {
    forward: [],
    left: [],
    right: [],
    back: [],
    unsupported: [],
    openPathCount: options.filter(
      (option) => option.isAvailable
        && !option.isBacktrack
        && option.stepKind !== 'backtrack',
    ).length,
    hasBackPath: false,
  };

  for (const option of options) {
    const slot = explorationDirectionGateSlot(option);

    if (slot) {
      layout[slot].push(option);
      layout.hasBackPath ||= slot === 'back' && option.isAvailable;
      continue;
    }

    layout.unsupported.push(option);
  }

  return layout;
}

export function explorationDirectionGateSlot(
  option: HeroExplorationMovementOptionReadModel,
): Exclude<ExplorationDirectionGateSlot, 'unknown'> | null {
  if (option.isBacktrack || option.stepKind === 'backtrack') {
    return 'back';
  }

  switch (option.directionKey?.toLowerCase()) {
    case 'forward':
    case 'north':
    case 'n':
      return 'forward';
    case 'left':
    case 'west':
    case 'w':
      return 'left';
    case 'right':
    case 'east':
    case 'e':
      return 'right';
    case 'back':
    case 'south':
    case 's':
      return 'back';
    default:
      return null;
  }
}

export function explorationDirectionGateIconClass(
  slot: ExplorationDirectionGateSlot,
): string {
  switch (slot) {
    case 'forward':
      return 'pi pi-arrow-up';
    case 'left':
      return 'pi pi-arrow-up-left';
    case 'right':
      return 'pi pi-arrow-up-right';
    case 'back':
      return 'pi pi-arrow-down';
    case 'unknown':
      return 'pi pi-compass';
  }
}
