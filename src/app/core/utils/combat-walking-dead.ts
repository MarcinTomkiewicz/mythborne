export interface WalkingDeadTimingFrame {
  position: number;
  direction: 1 | -1;
}

const WALKING_DEAD_FRAME_MS = 16;
const WALKING_DEAD_TRACK_PERIOD = 200;

export function walkingDeadTimingFrameAt(
  elapsedMs: number,
  speed: number,
): WalkingDeadTimingFrame {
  if (elapsedMs <= 0 || speed <= 0) {
    return { position: 0, direction: 1 };
  }

  const travelledPercent = elapsedMs / WALKING_DEAD_FRAME_MS * speed;
  const wrapped = travelledPercent % WALKING_DEAD_TRACK_PERIOD;
  const position = wrapped <= 100 ? wrapped : WALKING_DEAD_TRACK_PERIOD - wrapped;
  const direction = wrapped > 0 && wrapped < 100 ? 1 : -1;

  if (position <= 0) {
    return { position: 0, direction: 1 };
  }

  if (position >= 100) {
    return { position: 100, direction: -1 };
  }

  return {
    position: Number(position.toFixed(2)),
    direction,
  };
}
