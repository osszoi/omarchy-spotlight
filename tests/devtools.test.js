const assert = require("node:assert/strict")
const test = require("node:test")
const Dev = require("../lib/DevTools.js")
const Colors = require("../lib/Colors.js")
const DateMath = require("../lib/DateMath.js")
const NaturalTime = require("../lib/NaturalTime.js")

const NOW = Date.parse("2026-10-12T12:00:00Z")
const titles = (q, ctx = {}) => Dev.parse(q, Object.assign({ now: NOW }, ctx)).map(r => r.title)

test("base64 and utf-8 round-trip like node's own encoder", () => {
  for (const text of ["", "hello", "héllo 👋", "a\u0000b", "日本語"]) {
    const encoded = Dev.base64Encode(Dev.utf8Encode(text))
    assert.equal(encoded, Buffer.from(text).toString("base64"))
    assert.equal(Dev.utf8Decode(Dev.base64Decode(encoded)), text)
  }
  assert.equal(Dev.utf8Decode(Dev.base64Decode(Buffer.from("x?>").toString("base64url"))), "x?>")
  assert.equal(Dev.base64Decode("not base64!"), null)
  assert.equal(Dev.utf8Decode([0xff, 0xfe]), null)
})

test("b64, url and their decoders answer inline", () => {
  assert.deepEqual(titles("b64 héllo"), ["aMOpbGxv"])
  assert.deepEqual(titles("b64d aMOpbGxv"), ["héllo"])
  assert.deepEqual(titles("b64d AAEC/w=="), ["Decoded 4 bytes of binary"])
  assert.deepEqual(titles("url a b&c=ñ"), ["a%20b%26c%3D%C3%B1"])
  assert.deepEqual(titles("urld a+b%26c"), ["a b&c"])
  assert.deepEqual(titles("urld %E0%A4%A"), ["Not valid URL encoding"])
  assert.deepEqual(titles("chrome"), [])
})

test("jwt decodes without verifying and reports expiry", () => {
  const part = (o) => Buffer.from(JSON.stringify(o)).toString("base64url")
  const token = part({ alg: "RS256" }) + "." + part({ sub: "eduardo", exp: NOW / 1000 - 3600 }) + ".sig"
  const [row] = Dev.parse("jwt " + token, { now: NOW })
  assert.equal(row.title, "JWT · eduardo")
  assert.equal(row.subtitle, "expired 1h ago · alg RS256 · signature not verified")
  assert.deepEqual(JSON.parse(row.copy), { sub: "eduardo", exp: NOW / 1000 - 3600 })
  assert.deepEqual(titles("jwt a.b"), ["Not a JWT"])
})

test("jwt, json, b64d and urld alone read the clipboard", () => {
  assert.equal(Dev.wantsClipboard("jwt"), true)
  assert.equal(Dev.wantsClipboard("json "), true)
  assert.equal(Dev.wantsClipboard("b64"), false)
  assert.equal(Dev.wantsClipboard("jwt abc"), false)
  assert.deepEqual(titles("json"), ["Reading the clipboard…"])
  assert.deepEqual(titles("json", { clipboard: "" }), ["The clipboard is empty"])
  const [row] = Dev.parse("json", { now: NOW, clipboard: '{"a":[1,2]}' })
  assert.equal(row.copy, '{\n  "a": [\n    1,\n    2\n  ]\n}')
  assert.deepEqual(titles("json {bad"), ["Invalid JSON"])
})

test("timestamps, epoch and uuid", () => {
  assert.equal(Dev.parse("1730000000", { now: NOW })[0].copy, "2024-10-27T03:33:20Z")
  assert.equal(Dev.parse("1730000000123", { now: NOW })[0].copy, "2024-10-27T03:33:20.123Z")
  assert.match(Dev.parse("1730000000", { now: NOW })[0].subtitle, / · 2y ago$/)
  assert.deepEqual(titles("epoch"), [String(NOW / 1000)])
  assert.deepEqual(titles("uuid", { uuid: "6bce543e-e54d-4986-9229-c96722298c31" }), ["6bce543e-e54d-4986-9229-c96722298c31"])
  assert.deepEqual(titles("uuid"), ["Generating a UUID…"])
  assert.equal(Dev.wantsUuid(" UUID "), true)
})

test("colors convert between hex, rgb and hsl", () => {
  const formats = (q) => Colors.rows(q).map(r => r.title)
  assert.deepEqual(formats("#ff8800"), ["#FF8800", "rgb(255, 136, 0)", "hsl(32, 100%, 50%)"])
  assert.deepEqual(formats("#F80"), formats("#ff8800"))
  assert.deepEqual(formats("rgb(255 136 0)"), formats("#ff8800"))
  assert.deepEqual(formats("hsl(210deg 50% 40%)"), ["#336699", "rgb(51, 102, 153)", "hsl(210, 50%, 40%)"])
  assert.deepEqual(formats("rgba(255, 136, 0, 0.5)"), ["#FF880080", "rgba(255, 136, 0, 0.5)", "hsla(32, 100%, 50%, 0.5)"])
  assert.equal(Colors.rows("#ff8800")[0].swatch, "#ff8800")
  for (const bad of ["#xyz", "rgb(300, 0, 0)", "hsl(10, 120%, 5%)", "ff8800", "#12345"])
    assert.deepEqual(Colors.rows(bad), [], bad)
})

test("date math counts calendar days", () => {
  const now = new Date(2026, 9, 12, 10, 0)
  const run = (q) => DateMath.parse(q, now.getTime(), NaturalTime.parseWhen).map(r => [r.title, r.copy])
  assert.deepEqual(run("days until dec 24"), [["73 days until Thu Dec 24 2026", "73"]])
  assert.deepEqual(run("days since jan 1"), [["284 days since Thu Jan 1 2026", "284"]])
  assert.deepEqual(run("today + 45 days"), [["Thu Nov 26 2026", "2026-11-26"]])
  assert.deepEqual(run("2026-01-31 + 1 month"), [["Sat Feb 28 2026", "2026-02-28"]])
  assert.deepEqual(run("3 weeks ago"), [["Mon Sep 21 2026", "2026-09-21"]])
  assert.deepEqual(run("days until banana"), [])
  // across the March DST change, still whole days
  assert.equal(DateMath.daysBetween(new Date(2026, 2, 1), new Date(2026, 3, 1)), 31)
})

test("only time-shaped queries go to the tz lookup", () => {
  for (const q of ["time in tokyo", "tokyo time", "3pm est in caracas", "15:00 madrid to tokyo", "noon in london"])
    assert.equal(DateMath.isTimeZoneQuery(q), true, q)
  for (const q of ["chrome", "days until dec 24", "remind me in 20m to stretch", "12*7"])
    assert.equal(DateMath.isTimeZoneQuery(q), false, q)
})
