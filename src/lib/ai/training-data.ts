import { PrepTrainingSample } from "../db/schema";

// Seeded pseudo-random number generator for 100% deterministic, reproducible training data
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateSyntheticTrainingSamples(count: number = 180): PrepTrainingSample[] {
  const rand = seededRandom(42);
  const outlets = ["outlet-kondapur", "outlet-gachibowli", "outlet-kukatpally"];
  const samples: PrepTrainingSample[] = [];

  for (let i = 1; i <= count; i++) {
    const outlet_id = outlets[Math.floor(rand() * outlets.length)];
    // Items in order: typically 1 to 8
    const item_count = Math.floor(rand() * 7) + 1;
    // Average complexity per item is between 2.0 and 4.2
    const avg_complexity = 2.0 + rand() * 2.2;
    const complexity_points = Math.round(item_count * avg_complexity);
    // Queue depth currently in kitchen: 0 to 10
    const queue_depth = Math.floor(rand() * 11);
    // Peak period: 55% chance in training distribution
    const peak_period = rand() > 0.45 ? 1 : 0;
    // Weekend: 40% chance
    const is_weekend = rand() > 0.60 ? 1 : 0;

    // Base minimum prep for Hyderabad Biryani & slow cook kitchen: ~12 mins
    // Each item adds ~2.2 mins
    // Each complexity point adds ~1.1 mins
    // Each order ahead in queue adds ~1.7 mins
    // Peak period adds ~4.0 mins (kitchen station switching congestion)
    // Weekend adds ~2.5 mins
    // Random kitchen variation (gaussian approximation via uniform sum)
    const noise = ((rand() + rand() + rand()) / 3 - 0.5) * 6; // +/- 3 mins

    const rawPrepTime =
      12.0 +
      2.2 * item_count +
      1.1 * complexity_points +
      1.7 * queue_depth +
      4.0 * peak_period +
      2.5 * is_weekend +
      noise;

    const actual_prep_minutes = Math.max(15, Math.round(rawPrepTime));

    samples.push({
      id: `train-sample-${i.toString().padStart(3, "0")}`,
      outlet_id,
      item_count,
      complexity_points,
      queue_depth,
      peak_period,
      is_weekend,
      actual_prep_minutes,
      created_at: new Date(Date.now() - (count - i) * 3600000).toISOString(),
    });
  }

  return samples;
}

export const SEED_TRAINING_SAMPLES: PrepTrainingSample[] = generateSyntheticTrainingSamples(180);
