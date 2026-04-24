export interface FormulaChartSample {
  x: number;
  y: number;
}

export interface FormulaChartState {
  points: string;
  minY: number;
  maxY: number;
  firstX: number;
  lastX: number;
  canPlot: boolean;
}

export function toFormulaChartState(
  samples: readonly FormulaChartSample[],
  width = 520,
  height = 180,
  padding = 16
): FormulaChartState {
  if (samples.length < 2) {
    return {
      points: '',
      minY: 0,
      maxY: 0,
      firstX: 0,
      lastX: 0,
      canPlot: false,
    };
  }

  const minY = Math.min(...samples.map((sample) => sample.y));
  const maxY = Math.max(...samples.map((sample) => sample.y));
  const rangeY = maxY - minY || 1;
  const rangeX = samples.length - 1;
  const points = samples
    .map((sample, index) => {
      const x = padding + ((width - padding * 2) * index) / Math.max(rangeX, 1);
      const y = height - padding - ((sample.y - minY) / rangeY) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return {
    points,
    minY,
    maxY,
    firstX: samples[0].x,
    lastX: samples[samples.length - 1].x,
    canPlot: true,
  };
}
