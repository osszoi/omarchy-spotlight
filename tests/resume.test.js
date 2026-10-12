const assert = require("node:assert/strict")
const test = require("node:test")
const Resume = require("../lib/Resume.js")

const NOW = 1_800_000_000_000
const base = {
  initial: "", lastQuery: "", closedAt: 0, now: NOW, keepSeconds: 5, keepForever: false,
  aiQuery: "", aiHeld: false, aiBusy: false, aiSeen: false, aiFinishedAt: 0
}
const decide = (patch) => Resume.decide(Object.assign({}, base, patch))
const ai = { aiQuery: "ai: test", aiHeld: true }

test("a search comes back only within the keep window", () => {
  assert.equal(decide({}).text, "")
  assert.equal(decide({ lastQuery: "chr", closedAt: NOW - 3000 }).text, "chr")
  assert.equal(decide({ lastQuery: "chr", closedAt: NOW - 6000 }).text, "")
  assert.equal(decide({ lastQuery: "chr", closedAt: NOW - 1000, keepSeconds: 0 }).text, "")
  assert.equal(decide({ lastQuery: "chr", closedAt: NOW - 3_600_000, keepForever: true }).text, "chr")
})

test("a clock that went backwards counts as expired", () => {
  assert.equal(decide({ lastQuery: "chr", closedAt: NOW + 60_000 }).text, "")
})

test("a keybind payload wins over the last search", () => {
  assert.equal(decide({ initial: "remind me ", lastQuery: "chr", closedAt: NOW - 1000 }).text, "remind me ")
})

test("a seen answer follows the keep window and is dropped after it", () => {
  const seen = Object.assign({}, ai, { aiSeen: true, aiFinishedAt: NOW - 60_000, lastQuery: "ai: test" })
  assert.deepEqual(decide(Object.assign({ closedAt: NOW - 3000 }, seen)),
    { text: "ai: test", resumeAi: true, dropAi: false })
  assert.deepEqual(decide(Object.assign({ closedAt: NOW - 6000 }, seen)),
    { text: "", resumeAi: false, dropAi: true })
})

test("an unseen answer waits ten minutes from when it finished", () => {
  const unseen = Object.assign({}, ai, { lastQuery: "ai: test", closedAt: NOW - 3_600_000 })
  assert.deepEqual(decide(Object.assign({ aiFinishedAt: NOW - 9 * 60_000 }, unseen)),
    { text: "ai: test", resumeAi: true, dropAi: false })
  assert.deepEqual(decide(Object.assign({ aiFinishedAt: NOW - 11 * 60_000 }, unseen)),
    { text: "", resumeAi: false, dropAi: true })
})

test("a question still running always comes back, even after other searches", () => {
  const busy = Object.assign({}, ai, { aiBusy: true, closedAt: NOW - 3_600_000 })
  for (const lastQuery of ["ai: test", "", "terminal"])
    assert.deepEqual(decide(Object.assign({ lastQuery }, busy)),
      { text: "ai: test", resumeAi: true, dropAi: false })
})

test("an unseen answer beats the search typed while it was running", () => {
  const r = decide(Object.assign({}, ai, { aiFinishedAt: NOW - 60_000, lastQuery: "terminal", closedAt: NOW - 1000 }))
  assert.deepEqual(r, { text: "ai: test", resumeAi: true, dropAi: false })
})

test("clearing the box hides an answer even inside the window", () => {
  const r = decide(Object.assign({}, ai, { aiSeen: true, aiFinishedAt: NOW - 4000, lastQuery: "", closedAt: NOW - 1000 }))
  assert.equal(r.text, "")
  assert.equal(r.resumeAi, false)
})

test("a payload with the same ai query reopens a fresh answer", () => {
  const r = decide(Object.assign({}, ai, { initial: "ai: test", aiFinishedAt: NOW - 1000 }))
  assert.equal(r.resumeAi, true)
})
