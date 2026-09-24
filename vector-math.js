export function fromPolar(magnitude, angleDegrees) {
  const angle = (angleDegrees * Math.PI) / 180;
  return { x: magnitude * Math.cos(angle), y: magnitude * Math.sin(angle) };
}

export function magnitude(vector) {
  return Math.hypot(vector.x, vector.y);
}

export function angleDegrees(vector) {
  if (magnitude(vector) < 1e-9) return 0;
  return normalizeAngle((Math.atan2(vector.y, vector.x) * 180) / Math.PI);
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function normalizeAngle(angle) {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}
