// One per open in the empty search box. The "Try" ones must stay real
// cheatsheet examples, open() skips any phrase that would not fit the bar.

var PHRASES = [
  "Spotlight Search",
  "Search apps, files and more",
  "What are you looking for?",
  "Find anything",
  "Start typing to search",
  "Search, calculate, convert",
  "Open an app or find a file",
  "Jump to any window",
  "Search your clipboard",
  "What would you like to open?",
  "Ready when you are",
  "Search or run a command",
  "Convert units and currencies",
  "Try 12*7+3",
  "Try 5 km to mi",
  "Try 20% of 250",
  "Try 100 USD to EUR",
  "Try w: firefox",
  "Try ports:",
  "Type ? to see everything",
  "Try time in tokyo",
  "Try 3pm est in caracas",
  "Try days until dec 24",
  "Try today + 45 days",
  "Try #ff8800",
  "Try pick color",
  "Try uuid",
  "Try jwt",
  "Try 1730000000",
  "Try sys:",
  "Try kill: chrome",
  "Try repo: api",
  "Try k8s:",
  "Try jira:",
  "Try otp: github",
  "Stop a stuck app",
  "Copy a 2FA code",
  "Open a repo in a terminal"
]

function pick(previous, fits, random) {
  var ok = PHRASES.filter(function(p) { return p !== previous && fits(p) })
  if (ok.length === 0) return PHRASES[0]
  return ok[Math.min(ok.length - 1, Math.floor(random() * ok.length))]
}

if (typeof module !== "undefined") module.exports = { PHRASES: PHRASES, pick: pick }
