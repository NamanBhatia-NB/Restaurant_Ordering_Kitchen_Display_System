import { NextRequest, NextResponse } from "next/server";
import { defaultPrepEstimator, PrepFeatures } from "@/lib/ai/prep-estimator";

export async function GET() {
  const status = defaultPrepEstimator.getStatus();
  const weights = defaultPrepEstimator.getReadableWeights();

  return NextResponse.json({
    success: true,
    modelType: "ridge_regression",
    lambda: 1.0,
    status,
    weights,
    syntheticDataNote:
      "Model trained on synthetic restaurant kitchen physics dataset (180 reproducible samples). Features include items, complexity, queue depth, peak hour, and weekend.",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      itemCount = 1,
      complexityPoints = 3,
      queueDepth = 0,
      peakPeriod = 0,
      isWeekend = 0,
      outletMinimumPrepMinutes = 20,
    } = body;

    const features: PrepFeatures = {
      itemCount: Number(itemCount),
      complexityPoints: Number(complexityPoints),
      queueDepth: Number(queueDepth),
      peakPeriod: Number(peakPeriod),
      isWeekend: Number(isWeekend),
    };

    const prediction = defaultPrepEstimator.predict(features, Number(outletMinimumPrepMinutes));

    return NextResponse.json({
      success: true,
      prediction,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to predict prep time" },
      { status: 400 }
    );
  }
}
