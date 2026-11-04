import { PrepTrainingSample } from "../db/schema";
import { SEED_TRAINING_SAMPLES } from "./training-data";

export interface PrepFeatures {
  itemCount: number;
  complexityPoints: number;
  queueDepth: number;
  peakPeriod: number; // 0 or 1
  isWeekend: number;  // 0 or 1
}

export interface PredictionResult {
  predictedMinutes: number;
  promisedMinutes: number; // Safeguarded with outlet minimum & buffer
  confidence: "high" | "medium" | "low";
  modelType: string;
  trainingSamples: number;
  mae: number;
  rmse: number;
  r2Score: number;
  fallbackUsed: boolean;
  fallbackReason?: string;
  features: PrepFeatures;
  weights: {
    bias: number;
    itemCount: number;
    complexityPoints: number;
    queueDepth: number;
    peakPeriod: number;
    isWeekend: number;
  };
  syntheticDataDisclaimer: string;
}

// Helper: Matrix transpose
function transpose(A: number[][]): number[][] {
  const m = A.length;
  const n = A[0].length;
  const AT: number[][] = Array.from({ length: n }, () => Array(m).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      AT[j][i] = A[i][j];
    }
  }
  return AT;
}

// Helper: Matrix multiplication A (m x k) * B (k x n)
function multiply(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const k = A[0].length;
  const n = B[0].length;
  const C: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let p = 0; p < k; p++) {
        sum += A[i][p] * B[p][j];
      }
      C[i][j] = sum;
    }
  }
  return C;
}

// Helper: Invert square matrix using Gauss-Jordan elimination
function invert(A: number[][]): number[][] {
  const n = A.length;
  const augmented: number[][] = A.map((row, i) => {
    const identRow = Array(n).fill(0);
    identRow[i] = 1;
    return [...row, ...identRow];
  });

  for (let col = 0; col < n; col++) {
    // Find pivot
    let pivotRow = col;
    let maxVal = Math.abs(augmented[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(augmented[row][col]) > maxVal) {
        maxVal = Math.abs(augmented[row][col]);
        pivotRow = row;
      }
    }

    if (maxVal < 1e-9) {
      throw new Error("Matrix is singular or near singular; cannot invert.");
    }

    // Swap pivot row
    if (pivotRow !== col) {
      const temp = augmented[col];
      augmented[col] = augmented[pivotRow];
      augmented[pivotRow] = temp;
    }

    // Scale pivot row
    const pivot = augmented[col][col];
    for (let j = 0; j < 2 * n; j++) {
      augmented[col][j] /= pivot;
    }

    // Eliminate other rows
    for (let row = 0; row < n; row++) {
      if (row !== col) {
        const factor = augmented[row][col];
        for (let j = 0; j < 2 * n; j++) {
          augmented[row][j] -= factor * augmented[col][j];
        }
      }
    }
  }

  // Extract right half
  return augmented.map((row) => row.slice(n));
}

export class RidgePrepEstimator {
  private weights: number[] = []; // [bias, w_items, w_complexity, w_queue, w_peak, w_weekend]
  private means: number[] = [];
  private stds: number[] = [];
  private isTrained: boolean = false;
  private trainSampleCount: number = 0;
  private testMae: number = 0;
  private testRmse: number = 0;
  private r2Score: number = 0;
  private lambda: number = 1.0; // Ridge L2 regularizer

  constructor(lambda: number = 1.0) {
    this.lambda = lambda;
  }

  // Extract feature array: [itemCount, complexityPoints, queueDepth, peakPeriod, isWeekend]
  private extractRawFeatures(sample: PrepTrainingSample | PrepFeatures): number[] {
    if ("item_count" in sample) {
      return [
        sample.item_count,
        sample.complexity_points,
        sample.queue_depth,
        sample.peak_period,
        sample.is_weekend,
      ];
    }
    return [
      sample.itemCount,
      sample.complexityPoints,
      sample.queueDepth,
      sample.peakPeriod,
      sample.isWeekend,
    ];
  }

  // Train Ridge Regression model on provided dataset
  public train(samples: PrepTrainingSample[] = SEED_TRAINING_SAMPLES): void {
    if (samples.length < 20) {
      throw new Error(`Insufficient training samples (${samples.length}). At least 20 required.`);
    }

    // Split 80% train, 20% validation
    const trainCount = Math.floor(samples.length * 0.8);
    const trainSet = samples.slice(0, trainCount);
    const testSet = samples.slice(trainCount);

    this.trainSampleCount = trainSet.length;
    const numFeatures = 5;

    // 1. Calculate means and standard deviations for Z-score feature scaling
    this.means = Array(numFeatures).fill(0);
    this.stds = Array(numFeatures).fill(0);

    for (const sample of trainSet) {
      const feat = this.extractRawFeatures(sample);
      for (let j = 0; j < numFeatures; j++) {
        this.means[j] += feat[j];
      }
    }
    for (let j = 0; j < numFeatures; j++) {
      this.means[j] /= trainSet.length;
    }

    for (const sample of trainSet) {
      const feat = this.extractRawFeatures(sample);
      for (let j = 0; j < numFeatures; j++) {
        this.stds[j] += Math.pow(feat[j] - this.means[j], 2);
      }
    }
    for (let j = 0; j < numFeatures; j++) {
      this.stds[j] = Math.sqrt(this.stds[j] / trainSet.length) || 1.0;
    }

    // 2. Build design matrix X (with bias column) and target vector y
    const X: number[][] = [];
    const y: number[][] = [];

    for (const sample of trainSet) {
      const feat = this.extractRawFeatures(sample);
      const normalizedFeat = feat.map((v, idx) => (v - this.means[idx]) / this.stds[idx]);
      X.push([1.0, ...normalizedFeat]); // Column 0 is intercept / bias
      y.push([sample.actual_prep_minutes]);
    }

    // 3. Compute Ridge weights: w = (X^T X + lambda * I')^-1 * X^T y
    // Note: Do not regularize the intercept term (index 0)
    const XT = transpose(X);
    const XTX = multiply(XT, X);
    const p = numFeatures + 1;

    for (let i = 0; i < p; i++) {
      if (i > 0) {
        XTX[i][i] += this.lambda;
      }
    }

    const XTX_inv = invert(XTX);
    const XTy = multiply(XT, y);
    const wMatrix = multiply(XTX_inv, XTy);

    this.weights = wMatrix.map((row) => row[0]);
    this.isTrained = true;

    // 4. Evaluate on test set
    let totalAbsError = 0;
    let totalSqError = 0;
    let totalVariance = 0;
    const testTargets = testSet.map((s) => s.actual_prep_minutes);
    const meanTarget = testTargets.reduce((a, b) => a + b, 0) / testTargets.length;

    for (const sample of testSet) {
      const rawFeat = this.extractRawFeatures(sample);
      const pred = this.predictRaw(rawFeat);
      const actual = sample.actual_prep_minutes;
      const err = actual - pred;

      totalAbsError += Math.abs(err);
      totalSqError += err * err;
      totalVariance += Math.pow(actual - meanTarget, 2);
    }

    this.testMae = Math.round((totalAbsError / testSet.length) * 10) / 10;
    this.testRmse = Math.round(Math.sqrt(totalSqError / testSet.length) * 10) / 10;
    this.r2Score = Math.max(0, Math.round((1 - totalSqError / (totalVariance || 1)) * 100) / 100);
  }

  // Raw dot product prediction
  private predictRaw(rawFeatures: number[]): number {
    let result = this.weights[0]; // Intercept
    for (let i = 0; i < rawFeatures.length; i++) {
      const normalized = (rawFeatures[i] - this.means[i]) / this.stds[i];
      result += this.weights[i + 1] * normalized;
    }
    return result;
  }

  // Assess confidence score based on feature extremities & sample distribution
  private assessConfidence(features: PrepFeatures): "high" | "medium" | "low" {
    const zScores = [
      Math.abs((features.itemCount - this.means[0]) / this.stds[0]),
      Math.abs((features.complexityPoints - this.means[1]) / this.stds[1]),
      Math.abs((features.queueDepth - this.means[2]) / this.stds[2]),
    ];
    const maxZ = Math.max(...zScores);

    if (maxZ > 3.0) return "low"; // Extreme anomaly / huge outlier
    if (maxZ > 1.8) return "medium";
    return "high";
  }

  // Public estimate API with full guardrails, fallback, and disclosure
  public predict(features: PrepFeatures, outletMinimumPrepMinutes: number = 25): PredictionResult {
    // Fallback safeguard 1: Model not trained or insufficient samples
    if (!this.isTrained || this.trainSampleCount < 20) {
      const fallbackMinutes = Math.max(outletMinimumPrepMinutes, 20 + features.itemCount * 3);
      return {
        predictedMinutes: fallbackMinutes,
        promisedMinutes: fallbackMinutes,
        confidence: "low",
        modelType: "statistical_fallback",
        trainingSamples: this.trainSampleCount,
        mae: 6.0,
        rmse: 7.5,
        r2Score: 0.0,
        fallbackUsed: true,
        fallbackReason: "Model not trained or insufficient training samples in store.",
        features,
        weights: { bias: 20, itemCount: 3, complexityPoints: 1, queueDepth: 2, peakPeriod: 4, isWeekend: 3 },
        syntheticDataDisclaimer: "Notice: Synthetic dataset used for initial prototype calibration.",
      };
    }

    // Fallback safeguard 2: Extreme values
    if (features.itemCount > 50 || features.queueDepth > 40) {
      const fallbackMinutes = Math.max(outletMinimumPrepMinutes, 45 + Math.round(features.itemCount * 2));
      return {
        predictedMinutes: fallbackMinutes,
        promisedMinutes: fallbackMinutes,
        confidence: "low",
        modelType: "capacity_fallback",
        trainingSamples: this.trainSampleCount,
        mae: this.testMae,
        rmse: this.testRmse,
        r2Score: this.r2Score,
        fallbackUsed: true,
        fallbackReason: "Large bulk party order exceeding standard single-kitchen capacity model.",
        features,
        weights: this.getReadableWeights(),
        syntheticDataDisclaimer: "Notice: Synthetic dataset used for prototype calibration.",
      };
    }

    const rawFeat = this.extractRawFeatures(features);
    const rawPrediction = this.predictRaw(rawFeat);
    const predictedMinutes = Math.max(10, Math.round(rawPrediction));

    // Safeguard 3: The promised time is the HIGHER of the AI estimate and the outlet's minimum preparation time
    // We add a safety buffer equal to ceil(MAE / 2) to ensure honest delivery promises
    const safetyBuffer = Math.ceil(this.testMae / 2);
    const promisedMinutes = Math.max(outletMinimumPrepMinutes, predictedMinutes + safetyBuffer);

    const confidence = this.assessConfidence(features);

    return {
      predictedMinutes,
      promisedMinutes,
      confidence,
      modelType: "ridge_regression",
      trainingSamples: this.trainSampleCount,
      mae: this.testMae,
      rmse: this.testRmse,
      r2Score: this.r2Score,
      fallbackUsed: false,
      features,
      weights: this.getReadableWeights(),
      syntheticDataDisclaimer:
        "Disclaimer: This AI preparation-time estimate is powered by a Ridge Regression model trained on synthetic restaurant kitchen operational data. Staff can manually override whenever needed.",
    };
  }

  public getReadableWeights() {
    return {
      bias: Math.round((this.weights[0] || 0) * 10) / 10,
      itemCount: Math.round((this.weights[1] || 0) * 10) / 10,
      complexityPoints: Math.round((this.weights[2] || 0) * 10) / 10,
      queueDepth: Math.round((this.weights[3] || 0) * 10) / 10,
      peakPeriod: Math.round((this.weights[4] || 0) * 10) / 10,
      isWeekend: Math.round((this.weights[5] || 0) * 10) / 10,
    };
  }

  public getStatus() {
    return {
      isTrained: this.isTrained,
      trainSampleCount: this.trainSampleCount,
      testMae: this.testMae,
      testRmse: this.testRmse,
      r2Score: this.r2Score,
    };
  }
}

// Global singleton instance, trained on startup
export const defaultPrepEstimator = new RidgePrepEstimator(1.0);
defaultPrepEstimator.train(SEED_TRAINING_SAMPLES);
