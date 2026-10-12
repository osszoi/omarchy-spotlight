// "days until dec 24", "days since jan 1", "today + 45 days", "3 weeks ago".
// Dates are parsed by NaturalTime.parseWhen, passed in so this file stays standalone.

var ICON = "󰙹"
var DAY = 86400000
var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }

function label(d) { return DAYS[d.getDay()] + " " + MONTHS[d.getMonth()] + " " + d.getDate() + " " + d.getFullYear() }

function iso(d) {
  return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
}

// calendar days, so a DST change in between can't round it off by one
function daysBetween(a, b) {
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
    - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DAY)
}

function inWeeks(days) {
  var n = Math.abs(days)
  if (n < 14) return ""
  var weeks = Math.floor(n / 7), rest = n % 7
  return weeks + " weeks" + (rest ? " and " + rest + (rest === 1 ? " day" : " days") : "")
}

function unitOf(word) {
  var w = word.toLowerCase()
  return /^d/.test(w) ? "day" : /^w/.test(w) ? "week" : /^m/.test(w) ? "month" : /^y/.test(w) ? "year" : ""
}

function shift(date, amount, unit) {
  var d = new Date(date.getTime())
  if (unit === "day") d.setDate(d.getDate() + amount)
  else if (unit === "week") d.setDate(d.getDate() + amount * 7)
  else if (unit === "month") {
    var day = d.getDate()
    d.setDate(1)
    d.setMonth(d.getMonth() + amount)
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()))
  } else d.setFullYear(d.getFullYear() + amount)
  return d
}

function anchor(text, now, parseWhen, past) {
  var t = text.trim().toLowerCase()
  if (t === "today" || t === "now") return startOfDay(now)
  if (t === "yesterday") return shift(startOfDay(now), -1, "day")
  var when = parseWhen(text, now)
  if (!when || when.rest) return null
  var day = startOfDay(when.at)
  // the parser only looks ahead, "since jan 1" means the one that already happened
  if (past && day > now && !/\b\d{4}\b/.test(text)) day = shift(day, -1, "year")
  return day
}

function result(title, subtitle, copy) {
  return [{ key: "date.math", title: title, subtitle: subtitle, copy: copy, accessory: "Date", icon: ICON }]
}

function parse(query, nowMs, parseWhen) {
  var now = new Date(nowMs)
  var text = String(query || "").trim()
  var today = startOfDay(now)
  var m = text.match(/^(?:how many\s+)?(days|weeks)\s+(until|till|to|before|since|from)\s+(.+)$/i)
  if (m) {
    var past = /^(since|from)$/i.test(m[2])
    var target = anchor(m[3], now, parseWhen, past)
    if (!target) return []
    var days = daysBetween(today, target)
    var n = Math.abs(days)
    var weeks = inWeeks(days)
    if (/^weeks$/i.test(m[1]) && !weeks) weeks = (n / 7).toFixed(1) + " weeks"
    var head = /^weeks$/i.test(m[1]) && weeks ? weeks : n + (n === 1 ? " day" : " days")
    var title = days === 0 ? label(target) + " is today"
      : head + (days > 0 ? " until " : " since ") + label(target)
    return result(title, [/^weeks$/i.test(m[1]) ? n + " days" : weeks, iso(target)].filter(Boolean).join(" · "), String(n))
  }
  m = text.match(/^(.+?)\s*([+-])\s*(\d{1,4})\s*(d|days?|w|weeks?|mo|months?|y|years?)$/i)
  if (m) {
    var base = anchor(m[1], now, parseWhen, false)
    if (!base) return []
    var moved = shift(base, (m[2] === "-" ? -1 : 1) * Number(m[3]), unitOf(m[4]))
    return result(label(moved), m[1].trim() + " " + m[2] + " " + m[3] + " " + unitOf(m[4]) + (m[3] === "1" ? "" : "s")
      + " · " + iso(moved), iso(moved))
  }
  m = text.match(/^(\d{1,4})\s*(days?|weeks?|months?|years?)\s+(from now|from today|later|ago|before today)$/i)
  if (m) {
    var back = /^(ago|before today)$/i.test(m[3])
    var at = shift(today, (back ? -1 : 1) * Number(m[1]), unitOf(m[2]))
    return result(label(at), m[1] + " " + unitOf(m[2]) + (m[1] === "1" ? "" : "s") + (back ? " ago" : " from today")
      + " · " + iso(at), iso(at))
  }
  return []
}

// same shapes the helper's tz command reads, it answers null for places it doesn't know
var TZ_RE = /^(?:what )?(?:time|now|clock)(?: is it)? (?:in|at) .+$|^\S.{0,40} time$|^(?:noon|midnight|\d{1,2}(?::\d{2})?\s*(?:am|pm)?)(?: .+?)? (?:in|to) .+$/i

function isTimeZoneQuery(query) { return TZ_RE.test(String(query || "").trim().replace(/\s+/g, " ")) }

if (typeof module !== "undefined")
  module.exports = { parse: parse, daysBetween: daysBetween, isTimeZoneQuery: isTimeZoneQuery }
