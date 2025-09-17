export type BetaAB = { a: number; b: number };

export function thompson(vs: Record<string, BetaAB>) {
  const variants = Object.keys(vs);
  if (variants.length === 0) {
    throw new Error("No variants provided");
  }
  let bestV = variants[0];
  let bestS = -1;
  for (const v of variants) {
    const { a, b } = vs[v];
    const sample = betaSample(a, b);
    if (sample > bestS) {
      bestS = sample;
      bestV = v;
    }
  }
  return bestV;
}

function betaSample(a: number, b: number) {
  const g1 = -Math.log(1 - Math.random()) / Math.max(a, Number.EPSILON);
  const g2 = -Math.log(1 - Math.random()) / Math.max(b, Number.EPSILON);
  return g1 / (g1 + g2);
}
