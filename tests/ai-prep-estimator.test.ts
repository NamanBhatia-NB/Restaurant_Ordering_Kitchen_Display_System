import { describe, it, expect, beforeEach } from "vitest";
import { RidgePrepEstimator, defaultPrepEstimator, PrepFeatures } from "../src/lib/ai/prep-estimator";
import { generateSyntheticTrainingSamples } from "../src/lib/ai/training-data";

describe("AI Preparation Time Estimator (Ridge Regression)", () => {
  let estimator: RidgePrepEstimator;

  beforeEach(() => {
    estimator = new RidgePrepEstimator(1.0);
  });

  it("trains successfully on synthetic restaurant kitchen dataset", () => {
    const samples = generateSyntheticTrainingSamples(100);
    estimator.train(samples);

    const status = estimator.getStatus();
    expect(status.isTrained).toBe(true);
    expect(status.trainSampleCount).toBe(80); // 80% train split
    expect(status.testMae).toBeGreaterThan(0);
    expect(status.testMae).toBeLessThan(6.0); // High accuracy for kitchen physics
  });

  it("yields positive weights for items, complexity and queue depth", () => {
    const samples = generateSyntheticTrainingSamples(150);
    estimator.train(samples);

    const weights = estimator.getReadableWeights();
    // In kitchen physics, more items and queue depth strictly increase prep time
    expect(weights.itemCount).toBeGreaterThan(0);
    expect(weights.queueDepth).toBeGreaterThan(0);
    expect(weights.complexityPoints).toBeGreaterThan(0);
  });

  it("enforces outlet minimum preparation time safeguard", () => {
    const samples = generateSyntheticTrainingSamples(100);
    estimator.train(samples);

    // Single low-complexity item in an empty kitchen
    const features: PrepFeatures = {
      itemCount: 1,
      complexityPoints: 1,
      queueDepth: 0,
      peakPeriod: 0,
      isWeekend: 0,
    };

    const outletMin = 30; // 30 minutes minimum
    const result = estimator.predict(features, outletMin);

    // Even if raw regression predicts ~15 mins, promisedMinutes MUST be at least 30
    expect(result.promisedMinutes).toBeGreaterThanOrEqual(outletMin);
    expect(result.fallbackUsed).toBe(false);
  });

  it("uses conservative statistical fallback when model is not trained or has insufficient data", () => {
    const untrainedEstimator = new RidgePrepEstimator(1.0);

    const features: PrepFeatures = {
      itemCount: 4,
      complexityPoints: 10,
      queueDepth: 3,
      peakPeriod: 1,
      isWeekend: 0,
    };

    const result = untrainedEstimator.predict(features, 20);

    expect(result.fallbackUsed).toBe(true);
    expect(result.confidence).toBe("low");
    expect(result.modelType).toBe("statistical_fallback");
    expect(result.promisedMinutes).toBeGreaterThanOrEqual(20);
  });

  it("uses capacity fallback for extreme party orders exceeding normal single-kitchen threshold", () => {
    const samples = generateSyntheticTrainingSamples(100);
    estimator.train(samples);

    const extremeFeatures: PrepFeatures = {
      itemCount: 85, // Huge catering order
      complexityPoints: 200,
      queueDepth: 45,
      peakPeriod: 1,
      isWeekend: 1,
    };

    const result = estimator.predict(extremeFeatures, 25);
    expect(result.fallbackUsed).toBe(true);
    expect(result.modelType).toBe("capacity_fallback");
    expect(result.promisedMinutes).toBeGreaterThan(50);
  });

  it("correctly identifies confidence level based on feature distribution", () => {
    const samples = generateSyntheticTrainingSamples(150);
    estimator.train(samples);

    // Standard order within 1 standard deviation
    const standardFeatures: PrepFeatures = {
      itemCount: 3,
      complexityPoints: 8,
      queueDepth: 3,
      peakPeriod: 1,
      isWeekend: 0,
    };

    const result = estimator.predict(standardFeatures, 20);
    expect(["high", "medium"]).toContain(result.confidence);
  });
});
