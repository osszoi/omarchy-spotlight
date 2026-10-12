// #hex, rgb() and hsl() typed in the search box: one copyable row per format,
// the preview pane shows the swatch.

var ICON = "󰏘"

function clamp(n, low, high) { return Math.max(low, Math.min(high, n)) }

function hex2(n) { return ("0" + Math.round(n).toString(16)).slice(-2) }

function toHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  var d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  var h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: Math.round(h * 60) % 360, s: Math.round(s * 100), l: Math.round(l * 100) }
}

function fromHsl(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360; s /= 100; l /= 100
  if (s === 0) return [l * 255, l * 255, l * 255]
  var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q
  function channel(t) {
    t = t < 0 ? t + 1 : t > 1 ? t - 1 : t
    return 255 * (t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p)
  }
  return [channel(h + 1 / 3), channel(h), channel(h - 1 / 3)]
}

function alphaOf(text) {
  if (text === undefined || text === "") return 1
  var n = /%$/.test(text) ? parseFloat(text) / 100 : parseFloat(text)
  return isFinite(n) ? clamp(n, 0, 1) : NaN
}

function parseColor(query) {
  var text = String(query || "").trim().toLowerCase()
  var m = text.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/)
  if (m) {
    var h = m[1].length <= 4 ? m[1].replace(/./g, "$&$&") : m[1]
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16),
             a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 }
  }
  m = text.match(/^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*(?:[,\/]\s*([\d.]+%?)\s*)?\)$/)
  if (m) {
    var rgb = [+m[1], +m[2], +m[3]]
    if (rgb.some(function(v) { return v > 255 })) return null
    var a = alphaOf(m[4])
    return isFinite(a) ? { r: rgb[0], g: rgb[1], b: rgb[2], a: a } : null
  }
  m = text.match(/^hsla?\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%\s*(?:[,\/]\s*([\d.]+%?)\s*)?\)$/)
  if (m && +m[2] <= 100 && +m[3] <= 100) {
    var c = fromHsl(+m[1], +m[2], +m[3]), alpha = alphaOf(m[4])
    return isFinite(alpha) ? { r: Math.round(c[0]), g: Math.round(c[1]), b: Math.round(c[2]), a: alpha } : null
  }
  return null
}

function rows(query) {
  var c = parseColor(query)
  if (!c) return []
  var hsl = toHsl(c.r, c.g, c.b)
  var opaque = c.a >= 1
  var alpha = Math.round(c.a * 100) / 100
  var hex = "#" + hex2(c.r) + hex2(c.g) + hex2(c.b) + (opaque ? "" : hex2(c.a * 255))
  var formats = [
    ["hex", hex.toUpperCase(), "Hex"],
    ["rgb", opaque ? "rgb(" + c.r + ", " + c.g + ", " + c.b + ")" : "rgba(" + c.r + ", " + c.g + ", " + c.b + ", " + alpha + ")", "RGB"],
    ["hsl", opaque ? "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)" : "hsla(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%, " + alpha + ")", "HSL"]
  ]
  return formats.map(function(f) {
    return { key: "color." + f[0], title: f[1], subtitle: f[2] + " · Enter copies", copy: f[1],
             accessory: "Color", icon: ICON, swatch: "#" + hex2(c.r) + hex2(c.g) + hex2(c.b), alpha: c.a,
             formats: formats.map(function(x) { return { label: x[2], value: x[1] } }) }
  })
}

if (typeof module !== "undefined") module.exports = { parseColor: parseColor, rows: rows, toHsl: toHsl }
