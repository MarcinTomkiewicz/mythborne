export type BucketProfilePayload = {
  key: string;
  name: string;
  description: string | null;
  bucketCount: number;
  baseValue: number;
  linearGrowth: number;
  growthFactor: number;
  roundingStep: number;
  minIncrement: number;
  isActive: boolean;
};
