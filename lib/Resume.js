// What a plain open puts back in the box. A finished AI answer only starts
// the keep countdown once it was on screen, an unseen one waits UNSEEN_MS.

var UNSEEN_MS = 600000

function within(since, now, limit) {
  var elapsed = now - since
  return since > 0 && elapsed >= 0 && elapsed <= limit
}

function decide(s) {
  var recent = s.keepForever || (s.keepSeconds > 0 && within(s.closedAt, s.now, s.keepSeconds * 1000))
  var aiFresh = s.aiHeld && (s.aiBusy
    || (s.aiSeen ? recent : s.keepForever || within(s.aiFinishedAt, s.now, UNSEEN_MS)))
  // an answer still owed to the user wins over whatever was searched meanwhile
  var text = s.initial || (aiFresh && !s.aiSeen ? s.aiQuery : recent ? s.lastQuery : "")
  return {
    text: text,
    resumeAi: aiFresh && text !== "" && text === s.aiQuery,
    dropAi: s.aiHeld && !s.aiBusy && !aiFresh
  }
}

if (typeof module !== "undefined") module.exports = { UNSEEN_MS: UNSEEN_MS, decide: decide }
