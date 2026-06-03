import {
  ARMORY_PLAYER_SHELF_MAX_POSITION,
  ARMORY_PLAYER_SHELF_MIN_POSITION,
  ARMORY_UNSORTED_SHELF_POSITION,
} from '../constants/armory-shelves.const';

export function playerArmoryShelfPosition(value: number): number {
  if (
    !Number.isInteger(value) ||
    value < ARMORY_PLAYER_SHELF_MIN_POSITION ||
    value > ARMORY_PLAYER_SHELF_MAX_POSITION
  ) {
    throw new Error(
      `shelfPosition must be an integer from ${ARMORY_PLAYER_SHELF_MIN_POSITION} `
      + `to ${ARMORY_PLAYER_SHELF_MAX_POSITION}.`,
    );
  }

  return value;
}

export function movableArmoryShelfPosition(value: number): number {
  if (
    !Number.isInteger(value) ||
    value < ARMORY_UNSORTED_SHELF_POSITION ||
    value > ARMORY_PLAYER_SHELF_MAX_POSITION
  ) {
    throw new Error(
      `targetShelfPosition must be an integer from ${ARMORY_UNSORTED_SHELF_POSITION} `
      + `to ${ARMORY_PLAYER_SHELF_MAX_POSITION}.`,
    );
  }

  return value;
}
