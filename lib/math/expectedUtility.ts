export function expectedUtility(
  n: number,
  s: number,
  r: number,
  c: number,
  l: number,
  p: number,
) {
  const fact = (m: number) => (m < 2 ? 1 : Array.from({ length: m }, (_, i) => i + 1).reduce((a, b) => a * b, 1));
  const choose = (nn: number, kk: number) => fact(nn) / (fact(kk) * fact(nn - kk));
  let U = 0;
  for (let k = 0; k <= n; k += 1) {
    const prob = choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    const gain = r * Math.min(k, s) - c * Math.max(0, k - s) - l * Math.max(0, s - k);
    U += prob * gain;
  }
  return U;
}
