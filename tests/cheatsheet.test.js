const assert = require("node:assert/strict")
const test = require("node:test")
const Cheatsheet = require("../lib/Cheatsheet.js")
const Query = require("../lib/Query.js")

test("every entry is complete and filtering narrows the list", () => {
  for (const entry of Cheatsheet.ENTRIES)
    assert.ok(entry.section && entry.example && entry.what && entry.icon, entry.example)
  assert.equal(Cheatsheet.entries("").length, Cheatsheet.ENTRIES.length)
  assert.ok(Cheatsheet.entries("currency").length >= 1)
  assert.deepEqual(Cheatsheet.entries("nothing-matches-this"), [])
})

test("colon examples name real filters or views", () => {
  for (const entry of Cheatsheet.ENTRIES) {
    const match = entry.example.match(/^([a-z]+):/)
    if (!match) continue
    assert.notEqual(Query.parse(entry.example).filter, "", entry.example)
  }
})
