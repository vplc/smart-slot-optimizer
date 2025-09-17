export function queueWaitMGS(lambda: number, m: number, scv: number, s: number) {
  const rho = (lambda * m) / s;
  if (rho >= 1) {
    return Number.POSITIVE_INFINITY;
  }
  const ca2 = 1;
  const cs2 = scv;
  const Wq = ((ca2 + cs2) / 2) * (rho / (1 - rho)) * m;
  return Wq;
}
