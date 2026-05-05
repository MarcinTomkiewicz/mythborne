import {
  advanceWalkingDeadTimingFrame,
  isInsideWalkingDeadZone,
  toWalkingDeadSpeed,
  toWalkingDeadZone,
} from './combat-walking-dead';

describe('combat walking dead timing helpers', () => {
  it('builds a centered green zone with streak penalty', () => {
    expect(toWalkingDeadZone(30, 0)).toEqual({
      width: 30,
      start: 35,
      end: 65,
    });
    expect(toWalkingDeadZone(30, 10).width).toBe(8);
  });

  it('advances and bounces the shared timing indicator frame', () => {
    expect(advanceWalkingDeadTimingFrame({ position: 10, direction: 1 }, 1.25))
      .toEqual({ position: 11.25, direction: 1 });
    expect(advanceWalkingDeadTimingFrame({ position: 99, direction: 1 }, 2))
      .toEqual({ position: 100, direction: -1 });
    expect(advanceWalkingDeadTimingFrame({ position: 1, direction: -1 }, 2))
      .toEqual({ position: 0, direction: 1 });
  });

  it('keeps hit checking and speed as timing input helpers only', () => {
    const zone = toWalkingDeadZone(30, 0);

    expect(isInsideWalkingDeadZone(50, zone.start, zone.end)).toBeTrue();
    expect(isInsideWalkingDeadZone(90, zone.start, zone.end)).toBeFalse();
    expect(toWalkingDeadSpeed(2)).toBeGreaterThan(toWalkingDeadSpeed(0));
  });
});
