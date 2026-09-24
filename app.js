import { add, angleDegrees, fromPolar, magnitude } from "./vector-math.js";

const COLORS = { a: "#e45b49", b: "#3676d9", r: "#7048c8" };
const defaults = { a: { x: 4, y: 3 }, b: { x: -2, y: 4 } };
const state = { vectors: structuredClone(defaults), dragging: null, showComponents: true };

const canvas = document.querySelector("#vector-canvas");
const ctx = canvas.getContext("2d");
const controlsHost = document.querySelector("#vector-controls");
const template = document.querySelector("#vector-card-template");
const controlElements = {};
let view = { width: 0, height: 0, scale: 40, originX: 0, originY: 0 };

function makeControls(key, label) {
  const card = template.content.firstElementChild.cloneNode(true);
  card.dataset.vector = key;
  card.querySelector(".vector-name").textContent = `Vector ${key.toUpperCase()}`;
  card.querySelector(".vector-title").textContent = label;
  card.querySelector(".vector-symbol").textContent = key.toUpperCase();
  const inputs = {
    x: card.querySelector(".input-x"),
    y: card.querySelector(".input-y"),
    magnitude: card.querySelector(".input-magnitude"),
    angle: card.querySelector(".input-angle"),
  };
  inputs.x.addEventListener("input", () => setComponent(key, "x", inputs.x.value));
  inputs.y.addEventListener("input", () => setComponent(key, "y", inputs.y.value));
  const setPolar = () => {
    const mag = Math.max(0, finiteNumber(inputs.magnitude.value));
    const angle = finiteNumber(inputs.angle.value);
    state.vectors[key] = fromPolar(mag, angle);
    update(false);
  };
  inputs.magnitude.addEventListener("change", setPolar);
  inputs.angle.addEventListener("change", setPolar);
  controlsHost.append(card);
  controlElements[key] = inputs;
}

function finiteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function setComponent(key, component, value) {
  state.vectors[key][component] = finiteNumber(value);
  update(false, `${key}.${component}`);
}

function update(syncComponents = true, activeField = null) {
  for (const key of ["a", "b"]) {
    const vector = state.vectors[key];
    if (syncComponents && activeField !== `${key}.x`) controlElements[key].x.value = rounded(vector.x);
    if (syncComponents && activeField !== `${key}.y`) controlElements[key].y.value = rounded(vector.y);
    controlElements[key].magnitude.value = rounded(magnitude(vector));
    controlElements[key].angle.value = rounded(angleDegrees(vector));
  }
  const result = add(state.vectors.a, state.vectors.b);
  document.querySelector("#result-x").textContent = rounded(result.x);
  document.querySelector("#result-y").textContent = rounded(result.y);
  document.querySelector("#result-magnitude").textContent = rounded(magnitude(result));
  document.querySelector("#result-angle").textContent = `${rounded(angleDegrees(result))}°`;
  document.querySelector("#sum-equation").textContent =
    `⟨${rounded(state.vectors.a.x)}, ${rounded(state.vectors.a.y)}⟩ + ` +
    `⟨${rounded(state.vectors.b.x)}, ${rounded(state.vectors.b.y)}⟩ = ` +
    `⟨${rounded(result.x)}, ${rounded(result.y)}⟩`;
  draw();
}

function rounded(value) {
  const result = Math.round(value * 100) / 100;
  return Object.is(result, -0) ? 0 : result;
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  view.width = rect.width;
  view.height = rect.height;
  view.originX = rect.width / 2;
  view.originY = rect.height / 2;
  view.scale = Math.max(28, Math.min(48, Math.min(rect.width, rect.height) / 13));
  draw();
}

function draw() {
  if (!view.width) return;
  ctx.clearRect(0, 0, view.width, view.height);
  drawGrid();
  if (state.showComponents) {
    drawComponents({ x: 0, y: 0 }, state.vectors.a, COLORS.a);
    drawComponents(state.vectors.a, add(state.vectors.a, state.vectors.b), COLORS.b);
  }
  drawArrow({ x: 0, y: 0 }, add(state.vectors.a, state.vectors.b), COLORS.r, "A + B", 5, true);
  drawArrow({ x: 0, y: 0 }, state.vectors.a, COLORS.a, "A", 4, false);
  drawArrow(state.vectors.a, add(state.vectors.a, state.vectors.b), COLORS.b, "B", 4, false);
  drawOrigin();
}

function drawGrid() {
  ctx.fillStyle = "#fbfcfe";
  ctx.fillRect(0, 0, view.width, view.height);
  const halfColumns = Math.ceil(view.width / view.scale / 2);
  const halfRows = Math.ceil(view.height / view.scale / 2);
  ctx.lineWidth = 1;
  ctx.font = "11px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let i = -halfColumns; i <= halfColumns; i++) {
    const x = view.originX + i * view.scale;
    ctx.strokeStyle = i === 0 ? "#8895a9" : "#e7ebf1";
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, view.height); ctx.stroke();
    if (i !== 0) { ctx.fillStyle = "#8b96a7"; ctx.fillText(i, x, view.originY + 7); }
  }
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = -halfRows; i <= halfRows; i++) {
    const y = view.originY - i * view.scale;
    ctx.strokeStyle = i === 0 ? "#8895a9" : "#e7ebf1";
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(view.width, y); ctx.stroke();
    if (i !== 0) { ctx.fillStyle = "#8b96a7"; ctx.fillText(i, view.originX - 7, y); }
  }
  ctx.fillStyle = "#667085";
  ctx.textAlign = "right"; ctx.fillText("x", view.width - 10, view.originY - 12);
  ctx.textAlign = "left"; ctx.fillText("y", view.originX + 10, 12);
}

function toCanvas(vector) {
  return { x: view.originX + vector.x * view.scale, y: view.originY - vector.y * view.scale };
}

function fromCanvas(point) {
  return { x: (point.x - view.originX) / view.scale, y: (view.originY - point.y) / view.scale };
}

function drawComponents(startVector, endVector, color) {
  const start = toCanvas(startVector);
  const end = toCanvas(endVector);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.32;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.restore();
}

function drawArrow(startVector, endVector, color, label, lineWidth, dashed) {
  const start = toCanvas(startVector);
  const end = toCanvas(endVector);
  const theta = Math.atan2(end.y - start.y, end.x - start.x);
  const head = 13;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  if (dashed) ctx.setLineDash([10, 7]);
  ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - head * Math.cos(theta - Math.PI / 6), end.y - head * Math.sin(theta - Math.PI / 6));
  ctx.lineTo(end.x - head * Math.cos(theta + Math.PI / 6), end.y - head * Math.sin(theta + Math.PI / 6));
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(end.x, end.y, 8, 0, Math.PI * 2); ctx.fill();
  ctx.font = "800 13px Inter, sans-serif";
  ctx.fillText(label, end.x + 11, end.y - 11);
  ctx.restore();
}

function drawOrigin() {
  ctx.fillStyle = "#17213a";
  ctx.beginPath(); ctx.arc(view.originX, view.originY, 4.5, 0, Math.PI * 2); ctx.fill();
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

canvas.addEventListener("pointerdown", (event) => {
  const point = pointerPosition(event);
  const arrowTips = { a: state.vectors.a, b: add(state.vectors.a, state.vectors.b) };
  const nearest = ["a", "b"]
    .map((key) => ({ key, distance: Math.hypot(point.x - toCanvas(arrowTips[key]).x, point.y - toCanvas(arrowTips[key]).y) }))
    .sort((left, right) => left.distance - right.distance)[0];
  if (nearest.distance <= 22) {
    state.dragging = nearest.key;
    canvas.classList.add("dragging");
    canvas.setPointerCapture(event.pointerId);
  }
});

canvas.addEventListener("pointermove", (event) => {
  if (!state.dragging) return;
  const next = fromCanvas(pointerPosition(event));
  const vector = state.dragging === "b"
    ? { x: next.x - state.vectors.a.x, y: next.y - state.vectors.a.y }
    : next;
  state.vectors[state.dragging] = { x: Math.round(vector.x * 10) / 10, y: Math.round(vector.y * 10) / 10 };
  update();
});

function endDrag(event) {
  if (!state.dragging) return;
  state.dragging = null;
  canvas.classList.remove("dragging");
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}

canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);
document.querySelector("#components-toggle").addEventListener("change", (event) => {
  state.showComponents = event.target.checked;
  draw();
});
document.querySelector("#reset-button").addEventListener("click", () => {
  state.vectors = structuredClone(defaults);
  update();
});

makeControls("a", "First vector");
makeControls("b", "Second vector");
new ResizeObserver(resizeCanvas).observe(canvas);
update();
