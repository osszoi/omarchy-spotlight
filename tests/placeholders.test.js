const assert = require("node:assert/strict")
const test = require("node:test")
const Placeholders = require("../lib/Placeholders.js")
const Cheatsheet = require("../lib/Cheatsheet.js")
const Query = require("../lib/Query.js")

test("phrases are unique and short enough for the compact bar", () => {
  assert.equal(new Set(Placeholders.PHRASES).size, Placeholders.PHRASES.length)
  for (const p of Placeholders.PHRASES) assert.ok(p.length <= 30, p)
})

test("every Try phrase is a real cheatsheet example", () => {
  const examples = new Set(Cheatsheet.ENTRIES.map((e) => e.example))
  for (const p of Placeholders.PHRASES.filter((p) => p.startsWith("Try ")))
    assert.ok(examples.has(p.slice(4)), p)
  assert.equal(Query.parse("?").filter, "help")
})

test("pick never repeats the previous phrase and respects fits", () => {
  const first = Placeholders.PHRASES[0]
  assert.notEqual(Placeholders.pick(first, () => true, () => 0), first)
  assert.equal(Placeholders.pick("", (p) => p === "Find anything", () => 0.99), "Find anything")
  assert.equal(Placeholders.pick("", () => false, () => 0.5), first)
  assert.ok(Placeholders.PHRASES.includes(Placeholders.pick("", () => true, () => 0.999999)))
})
