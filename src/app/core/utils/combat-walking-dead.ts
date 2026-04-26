export const COMBAT_TURN_LIMIT = 10;
export const WALKING_DEAD_MIN_ZONE = 8;
export const WALKING_DEAD_BASE_SPEED = 1.25;
export const WALKING_DEAD_STREAK_SPEED = 0.18;
export const WALKING_DEAD_STREAK_ZONE_PENALTY = 4;
export const WALKING_DEAD_CENTER = 50;

export const toWalkingDeadZone = (baseWidth: number, streak: number) => {
  const width = Math.max(
    WALKING_DEAD_MIN_ZONE,
    Math.min(100, baseWidth - streak * WALKING_DEAD_STREAK_ZONE_PENALTY)
  );
  const start = Math.max(0, WALKING_DEAD_CENTER - width / 2);
  const end = Math.min(100, WALKING_DEAD_CENTER + width / 2);

  return { width, start, end };
};

export const toWalkingDeadSpeed = (streak: number) =>
  WALKING_DEAD_BASE_SPEED + streak * WALKING_DEAD_STREAK_SPEED;

export const isInsideWalkingDeadZone = (position: number, start: number, end: number) =>
  position >= start && position <= end;
