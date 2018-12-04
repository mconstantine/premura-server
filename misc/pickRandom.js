module.exports = function pickRandom(from, limit) {
  if (from === undefined) {
    return Math.random() < 0.5
  }

  if (Array.isArray(from)) {
    return from[Math.round(Math.random() * (from.length - 1))]
  }

  if (!Number.isNaN(from)) {
    return from + Math.round(Math.random() * (limit - from))
  }
}
