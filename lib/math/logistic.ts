export type FeatureVec = Record<string, number>;

export function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z));
}

export function dot(beta: FeatureVec, x: FeatureVec) {
  let s = 0;
  for (const k in x) {
    if (Object.prototype.hasOwnProperty.call(x, k)) {
      s += (beta[k] || 0) * x[k];
    }
  }
  return s;
}

export function phat(
  beta: FeatureVec,
  x: FeatureVec,
  u_client = 0,
  v_service = 0,
) {
  return sigmoid(dot(beta, x) + u_client + v_service);
}
