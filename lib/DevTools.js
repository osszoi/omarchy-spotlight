// Inline developer answers, all offline. uuid comes from the helper (QML has
// no crypto RNG) and jwt/json/b64d/urld with nothing typed read the clipboard,
// a real token rarely fits the search box.

var COMMANDS = {
  uuid: "uuid", guid: "uuid",
  b64: "b64", base64: "b64",
  b64d: "b64d", unbase64: "b64d",
  url: "url", urlencode: "url",
  urld: "urld", urldecode: "urld",
  jwt: "jwt",
  json: "json",
  epoch: "epoch", timestamp: "epoch", unix: "epoch"
}
var CLIPBOARD_FALLBACK = { jwt: true, json: true, b64d: true, urld: true }
var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
var ICON = "󰅩"

function utf8Encode(text) {
  var bytes = []
  for (var i = 0; i < text.length; i++) {
    var c = text.charCodeAt(i)
    if (c >= 0xD800 && c < 0xDC00 && i + 1 < text.length) {
      var low = text.charCodeAt(i + 1)
      if (low >= 0xDC00 && low < 0xE000) { c = 0x10000 + ((c - 0xD800) << 10) + (low - 0xDC00); i++ }
    }
    if (c < 0x80) bytes.push(c)
    else if (c < 0x800) bytes.push(0xC0 | c >> 6, 0x80 | c & 63)
    else if (c < 0x10000) bytes.push(0xE0 | c >> 12, 0x80 | c >> 6 & 63, 0x80 | c & 63)
    else bytes.push(0xF0 | c >> 18, 0x80 | c >> 12 & 63, 0x80 | c >> 6 & 63, 0x80 | c & 63)
  }
  return bytes
}

// null when the bytes are not valid UTF-8, so binary never shows as mojibake
function utf8Decode(bytes) {
  var out = ""
  for (var i = 0; i < bytes.length;) {
    var b = bytes[i], need = b < 0x80 ? 0 : b >= 0xF0 && b < 0xF8 ? 3 : b >= 0xE0 ? 2 : b >= 0xC2 && b < 0xE0 ? 1 : -1
    if (need < 0 || i + need >= bytes.length) return null
    var c = need ? b & (0x3F >> need) : b
    for (var k = 1; k <= need; k++) {
      if ((bytes[i + k] & 0xC0) !== 0x80) return null
      c = c << 6 | bytes[i + k] & 63
    }
    if (c >= 0x10000) {
      c -= 0x10000
      out += String.fromCharCode(0xD800 + (c >> 10), 0xDC00 + (c & 0x3FF))
    } else {
      out += String.fromCharCode(c)
    }
    i += need + 1
  }
  return out
}

function base64Encode(bytes) {
  var out = ""
  for (var i = 0; i < bytes.length; i += 3) {
    var n = bytes[i] << 16 | (bytes[i + 1] || 0) << 8 | (bytes[i + 2] || 0)
    out += ALPHABET[n >> 18 & 63] + ALPHABET[n >> 12 & 63]
      + (i + 1 < bytes.length ? ALPHABET[n >> 6 & 63] : "=")
      + (i + 2 < bytes.length ? ALPHABET[n & 63] : "=")
  }
  return out
}

// takes standard and url-safe alphabets, with or without padding
function base64Decode(text) {
  var clean = String(text).replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "")
  if (!/^[A-Za-z0-9+\/]*$/.test(clean) || clean.length % 4 === 1) return null
  var bytes = []
  for (var i = 0; i < clean.length; i += 4) {
    var n = 0, chars = Math.min(4, clean.length - i)
    for (var k = 0; k < 4; k++) n = n << 6 | (k < chars ? ALPHABET.indexOf(clean[i + k]) : 0)
    bytes.push(n >> 16 & 255)
    if (chars > 2) bytes.push(n >> 8 & 255)
    if (chars > 3) bytes.push(n & 255)
  }
  return bytes
}

function pad(n) { return (n < 10 ? "0" : "") + n }

function isoUtc(ms) { return new Date(ms).toISOString().replace(/\.000Z$/, "Z") }

function localStamp(ms) {
  var d = new Date(ms)
  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return days[d.getDay()] + " " + months[d.getMonth()] + " " + d.getDate() + " " + d.getFullYear()
    + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())
}

function relative(ms, now) {
  var minutes = Math.round((ms - now) / 60000), abs = Math.abs(minutes)
  var text = abs < 1 ? "now" : abs < 60 ? abs + "m" : abs < 2880 ? Math.round(abs / 60) + "h"
    : abs < 86400 ? Math.round(abs / 1440) + "d" : abs < 525600 ? Math.round(abs / 43200) + "mo"
    : Math.round(abs / 525600) + "y"
  return text === "now" ? "now" : minutes > 0 ? "in " + text : text + " ago"
}

function row(command, title, subtitle, copyText, detail) {
  return { key: "dev." + command, title: title, subtitle: subtitle, copy: copyText,
           detail: detail || "", accessory: "Dev", icon: ICON }
}

function failure(command, title, subtitle) {
  return { key: "dev." + command + ".error", title: title, subtitle: subtitle, copy: "",
           detail: "", accessory: "Dev", icon: ICON, error: true }
}

function decodeJsonPart(part) {
  var bytes = base64Decode(part)
  var text = bytes ? utf8Decode(bytes) : null
  if (text === null) return null
  try { return JSON.parse(text) } catch (e) { return null }
}

function jwtRows(token, now) {
  var parts = String(token).trim().split(".")
  var header = parts.length === 3 ? decodeJsonPart(parts[0]) : null
  var payload = header ? decodeJsonPart(parts[1]) : null
  if (!header || !payload || typeof payload !== "object")
    return [failure("jwt", "Not a JWT", "Expected header.payload.signature")]
  var facts = [header.alg ? "alg " + header.alg : "", "signature not verified"]
  if (typeof payload.exp === "number")
    facts.unshift((payload.exp * 1000 < now ? "expired " : "expires ") + relative(payload.exp * 1000, now))
  var who = payload.sub || payload.email || payload.preferred_username || payload.client_id || ""
  var pretty = JSON.stringify(payload, null, 2)
  return [row("jwt", "JWT" + (who ? " · " + who : ""), facts.filter(Boolean).join(" · "), pretty,
              "header " + JSON.stringify(header, null, 2) + "\n\npayload " + pretty)]
}

function epochRows(value, now) {
  var ms = value.length === 13 ? Number(value) : Number(value) * 1000
  return [row("epoch", localStamp(ms), isoUtc(ms) + " · " + relative(ms, now), isoUtc(ms))]
}

function parse(query, ctx) {
  ctx = ctx || {}
  var now = ctx.now || Date.now()
  var text = String(query || "").trim()
  if (/^\d{10}$|^\d{13}$/.test(text)) return epochRows(text, now)
  var match = text.match(/^([a-z0-9]+)(?:\s+([\s\S]*))?$/i)
  var command = match ? COMMANDS[match[1].toLowerCase()] : undefined
  if (!command) return []
  var arg = (match[2] || "").trim()
  if (!arg && CLIPBOARD_FALLBACK[command]) {
    if (typeof ctx.clipboard !== "string") return [failure(command, "Reading the clipboard…", command + " with nothing typed uses the clipboard")]
    arg = ctx.clipboard.trim()
    if (!arg) return [failure(command, "The clipboard is empty", "Type the text after " + match[1] + " or copy it first")]
  }

  if (command === "uuid") {
    return ctx.uuid ? [row("uuid", ctx.uuid, "Random UUID v4 · Enter copies, a new one next time", ctx.uuid)]
      : [failure("uuid", "Generating a UUID…", "")]
  }
  if (command === "epoch" && !arg) {
    var seconds = String(Math.floor(now / 1000))
    return [row("epoch", seconds, "Now in Unix seconds · " + now + " ms", seconds)]
  }
  if (command === "epoch") return /^\d{10}$|^\d{13}$/.test(arg) ? epochRows(arg, now)
    : [failure("epoch", "Not a Unix timestamp", "10 digits for seconds, 13 for milliseconds")]
  if (!arg) return [failure(command, match[1] + " what?", "Type the text after " + match[1])]

  if (command === "b64") {
    var encoded = base64Encode(utf8Encode(arg))
    return [row("b64", encoded, "Base64 of the text", encoded)]
  }
  if (command === "b64d") {
    var bytes = base64Decode(arg)
    if (!bytes) return [failure("b64d", "Not valid Base64", "")]
    var decoded = utf8Decode(bytes)
    return decoded === null ? [failure("b64d", "Decoded " + bytes.length + " bytes of binary", "Not text, nothing to copy")]
      : [row("b64d", decoded, "Decoded from Base64", decoded, decoded)]
  }
  if (command === "url") {
    var escaped = encodeURIComponent(arg)
    return [row("url", escaped, "URL-encoded", escaped)]
  }
  if (command === "urld") {
    try {
      var plain = decodeURIComponent(arg.replace(/\+/g, " "))
      return [row("urld", plain, "URL-decoded", plain, plain)]
    } catch (e) {
      return [failure("urld", "Not valid URL encoding", "")]
    }
  }
  if (command === "jwt") return jwtRows(arg, now)
  if (command === "json") {
    try {
      var pretty = JSON.stringify(JSON.parse(arg), null, 2)
      var lines = pretty.split("\n").length
      return [row("json", lines > 1 ? pretty.split("\n").slice(0, 2).join(" ").slice(0, 120) + " …" : pretty,
                  "Valid JSON · " + lines + " lines pretty-printed · Enter copies", pretty, pretty)]
    } catch (e) {
      return [failure("json", "Invalid JSON", String(e.message || e).slice(0, 120))]
    }
  }
  return []
}

function wantsClipboard(query) {
  var match = String(query || "").trim().match(/^([a-z0-9]+)$/i)
  return !!match && CLIPBOARD_FALLBACK[COMMANDS[match[1].toLowerCase()]] === true
}

function wantsUuid(query) { return COMMANDS[String(query || "").trim().toLowerCase()] === "uuid" }

if (typeof module !== "undefined")
  module.exports = { parse: parse, wantsClipboard: wantsClipboard, wantsUuid: wantsUuid,
                     base64Encode: base64Encode, base64Decode: base64Decode,
                     utf8Encode: utf8Encode, utf8Decode: utf8Decode }
