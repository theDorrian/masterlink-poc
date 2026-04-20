const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(s) {
  return typeof s === 'string' && EMAIL_RE.test(s.trim());
}

function isPositiveNum(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0;
}

function isNonNegInt(v) {
  const n = parseInt(v, 10);
  return Number.isInteger(n) && n >= 0;
}

// Clamp a query param integer to [min, max], falling back to def if invalid
function clampInt(v, min, max, def) {
  const n = parseInt(v, 10);
  if (!Number.isInteger(n)) return def;
  return Math.min(Math.max(n, min), max);
}

function isInRange(v, min, max) {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= min && n <= max;
}

// Floor to 2 decimal places — avoids floating-point drift in money arithmetic
function round2(n) {
  return Math.floor(n * 100) / 100;
}

module.exports = { isEmail, isPositiveNum, isNonNegInt, clampInt, isInRange, round2 };
