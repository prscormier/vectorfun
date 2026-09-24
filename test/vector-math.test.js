import test from "node:test";
import assert from "node:assert/strict";
import { add, angleDegrees, fromPolar, magnitude, normalizeAngle } from "../vector-math.js";

test("adds vectors component by component", () => {
  assert.deepEqual(add({ x: 4, y: 3 }, { x: -2, y: 4 }), { x: 2, y: 7 });
});

test("calculates magnitude using the Pythagorean theorem", () => {
  assert.equal(magnitude({ x: 3, y: 4 }), 5);
});

test("converts polar values to components", () => {
  const vector = fromPolar(10, 30);
  assert.ok(Math.abs(vector.x - 8.660254) < 1e-6);
  assert.ok(Math.abs(vector.y - 5) < 1e-6);
});

test("reports direction in the range 0 to 360 degrees", () => {
  assert.equal(angleDegrees({ x: 0, y: -2 }), 270);
  assert.equal(normalizeAngle(-45), 315);
});

test("gives the zero vector a stable direction", () => {
  assert.equal(angleDegrees({ x: 0, y: 0 }), 0);
});
