export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function jitter(base: number, variance = 0.3): number {
  const delta = base * variance;
  return base - delta + Math.random() * delta * 2;
}

export async function simulateDelay(base = 800, variance = 0.4): Promise<void> {
  await sleep(jitter(base, variance));
}

export async function simulateApiCall<T>(fn: () => T, delay = 600, failureRate = 0.05): Promise<T> {
  await simulateDelay(delay);
  if (Math.random() < failureRate) {
    throw new Error("Simulated API failure — request timed out");
  }
  return fn();
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomPickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
