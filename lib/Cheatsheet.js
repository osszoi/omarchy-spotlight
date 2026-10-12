// Entries for the help: view (also `?`). Enter on one puts its example in the
// search box. Keep examples to things a test or the README says work.

var ENTRIES = [
  { section: "Search everything", example: "chrom", what: "Apps, windows, files, commands and clipboard in one list", icon: "\uDB80\uDF49" },
  { section: "Search everything", example: "a: steam", what: "Apps only (also app:)", icon: "\uDB80\uDED7" },
  { section: "Search everything", example: "w: firefox", what: "Jump to an open window; w: alone lists them all", icon: "\uDB81\uDDAF" },
  { section: "Search everything", example: "f invoice", what: "Files only (also f: or file:)", icon: "\uDB80\uDE4B" },
  { section: "Search everything", example: "cb ssh", what: "Clipboard history only (also cb:)", icon: "\uDB80\uDD4C" },
  { section: "Search everything", example: "cmd: theme", what: "Spotlight and Omarchy commands only (also action:)", icon: "\uDB81\uDC93" },
  { section: "Calculate and convert", example: "12*7+3", what: "Calculator, Enter copies the result", icon: "\uDB80\uDCEC" },
  { section: "Calculate and convert", example: "sqrt(2) * pi", what: "sqrt cbrt abs round floor ceil sin cos tan ln log exp min max pow hypot, pi tau e", icon: "\uDB80\uDCEC" },
  { section: "Calculate and convert", example: "20% of 250", what: "Percentages, also 250 + 10%", icon: "\uDB80\uDCEC" },
  { section: "Calculate and convert", example: "5 km to mi", what: "Length, mass, data, time, speed, volume and area units", icon: "\uDB81\uDC64" },
  { section: "Calculate and convert", example: "100 c to f", what: "Temperature: c, f, k", icon: "\uDB81\uDC64" },
  { section: "Calculate and convert", example: "100 USD to EUR", what: "Currency, rates from frankfurter.dev cached for a day", icon: "\uDB81\uDC64" },
  { section: "Calculate and convert", example: "23 EUR + 43 JPY", what: "Mixed-currency totals", icon: "\uDB81\uDC64" },
  { section: "Calculate and convert", example: "#ff8800", what: "A color as hex, rgb and hsl with a swatch, rgb() and hsl() work too", icon: "\uDB80\uDFD8" },
  { section: "Calculate and convert", example: "pick color", what: "Pick a color off the screen and copy its hex", icon: "\uDB80\uDE0A" },
  { section: "Time and dates", example: "time in tokyo", what: "The time somewhere else, also tokyo time", icon: "\uDB80\uDD50" },
  { section: "Time and dates", example: "3pm est in caracas", what: "Convert a time between places or zones (EST, CET, VET...)", icon: "\uDB80\uDD50" },
  { section: "Time and dates", example: "days until dec 24", what: "Days until or since a date, weeks until works too", icon: "\uDB81\uDE79" },
  { section: "Time and dates", example: "today + 45 days", what: "Date math, also dec 24 - 3 weeks and 3 weeks ago", icon: "\uDB81\uDE79" },
  { section: "Dev tools", example: "uuid", what: "A random UUID v4, Enter copies", icon: "\uDB80\uDD69" },
  { section: "Dev tools", example: "b64 hello", what: "Base64 encode, b64d decodes", icon: "\uDB80\uDD69" },
  { section: "Dev tools", example: "url a b&c", what: "URL-encode, urld decodes", icon: "\uDB80\uDD69" },
  { section: "Dev tools", example: "jwt", what: "Decode the JWT in your clipboard (or type it after jwt), signature not checked", icon: "\uDB80\uDD69" },
  { section: "Dev tools", example: "json", what: "Pretty-print the JSON in your clipboard (or type it after json)", icon: "\uDB80\uDD69" },
  { section: "Dev tools", example: "1730000000", what: "Unix timestamp to a date, epoch alone gives the current one", icon: "\uDB80\uDD69" },
  { section: "Reminders and calendar", example: "remind me in 20m to check the oven", what: "Desktop reminder", icon: "\uDB82\uDC8C" },
  { section: "Reminders and calendar", example: "remind me to call bob in 20m", what: "The time can go at the end too", icon: "\uDB82\uDC8C" },
  { section: "Reminders and calendar", example: "event dec 24 at 18:00", what: "Calendar event, saved as an .ics file", icon: "\uDB83\uDE17" },
  { section: "Reminders and calendar", example: "standup in 3 days at 9:30", what: "Relative dates and times", icon: "\uDB83\uDE17" },
  { section: "System views", example: "ports:", what: "Listening ports and the process behind each one", icon: "\uDB80\uDE00" },
  { section: "System views", example: "ssh:", what: "Hosts from ~/.ssh/config and known_hosts, Enter connects", icon: "\uDB80\uDF06" },
  { section: "System views", example: "docker:", what: "Containers, with logs in the preview", icon: "\uDB82\uDC68" },
  { section: "System views", example: "services:", what: "System and user services", icon: "\uDB81\uDC93" },
  { section: "System views", example: "mounts:", what: "Mounted filesystems and free space", icon: "\uDB80\uDECA" },
  { section: "System views", example: "audio:", what: "Switch audio outputs and inputs", icon: "\uDB81\uDCC3" },
  { section: "System views", example: "wifi:", what: "Wi-Fi networks, Enter connects", icon: "\uDB82\uDD28" },
  { section: "System views", example: "bluetooth:", what: "Paired Bluetooth devices", icon: "\uDB80\uDCAF" },
  { section: "System views", example: "man: tar", what: "tldr pages for a command (also tldr:)", icon: "\uDB80\uDEFC" },
  { section: "System views", example: "sys:", what: "IPs, memory, disk, battery, uptime; Enter copies, Public IP looks itself up", icon: "\uDB82\uDE07" },
  { section: "System views", example: "kill: chrome", what: "Busiest processes first; Enter twice stops one, Shift+Enter twice force-kills", icon: "\uDB80\uDD5C" },
  { section: "Dev", example: "repo: api", what: "Git repos under ~/Work, last touched first; Enter opens a terminal there", icon: "\uDB83\uDCCF" },
  { section: "Dev", example: "k8s:", what: "Pods across your kube contexts, broken ones first; Enter follows logs", icon: "\uDB84\uDCFE" },
  { section: "Dev", example: "jira:", what: "Your open Jira issues; jira: ABC-123 opens any issue", icon: "\uDB80\uDF03" },
  { section: "Dev", example: "ABC-123", what: "An issue key anywhere opens it in Jira", icon: "\uDB80\uDF03" },
  { section: "Dev", example: "otp: github", what: "2FA codes from the 2FA bar plugin; Enter copies, Shift+Enter types it", icon: "\uDB82\uDDAF" },
  { section: "GitHub", example: "gh:", what: "Your repos and your orgs' repos, Enter opens one on GitHub", icon: "\uDB80\uDEA4" },
  { section: "GitHub", example: "gh: api", what: "Only repos whose owner/name contains the text", icon: "\uDB80\uDEA4" },
  { section: "GitHub", example: "pr:", what: "Open pull requests in your and your orgs' repos, newest activity first", icon: "\uDB81\uDCC2" },
  { section: "GitHub", example: "pr: dependabot", what: "Filter PRs by title, repo, author or #number", icon: "\uDB81\uDCC2" },
  { section: "Web", example: "gh quickshell", what: "Search GitHub", icon: "\uDB80\uDEA4" },
  { section: "Web", example: "yt lofi", what: "Search YouTube", icon: "\uDB81\uDDC3" },
  { section: "Web", example: "aw hyprland", what: "Arch Wiki; also aur pkg w so mdn npm crates docker maps img hn ddg kagi omarchy", icon: "\uDB82\uDCC7" },
  { section: "Web", example: "tr good morning to spanish", what: "Translate with DeepL", icon: "\uDB81\uDDCA" },
  { section: "Web", example: "web: best ramen", what: "Search with your default engine", icon: "\uDB80\uDEAD" },
  { section: "Web", example: "archlinux.org", what: "Type a URL to open it", icon: "\uDB81\uDD9F" },
  { section: "Desktop and Omarchy", example: "night light", what: "Live toggles: night light, wifi, bluetooth, do not disturb, stay awake, gaps", icon: "\uDB81\uDD94" },
  { section: "Desktop and Omarchy", example: "do not disturb", what: "Silence notifications", icon: "\uDB80\uDC9B" },
  { section: "Desktop and Omarchy", example: "screenshot", what: "Region, window or full screen; also screen recording", icon: "\uDB82\uDE6D" },
  { section: "Desktop and Omarchy", example: "capture text", what: "Read text off the screen (OCR), or scan a QR code", icon: "\uDB81\uDE9E" },
  { section: "Desktop and Omarchy", example: "theme", what: "Change theme, font or background", icon: "\uDB83\uDE0C" },
  { section: "Desktop and Omarchy", example: "next background", what: "Cycle the wallpaper", icon: "\uDB83\uDD66" },
  { section: "Desktop and Omarchy", example: "keybindings", what: "Search Hyprland keybindings", icon: "\uDB80\uDF0C" },
  { section: "Desktop and Omarchy", example: "update", what: "Update Omarchy and packages", icon: "\uDB81\uDEB0" },
  { section: "Desktop and Omarchy", example: "lock", what: "Lock screen; also log out, restart, shut down", icon: "\uDB80\uDF3E" },
  { section: "Ask AI", example: "ai: explain how DNS works", what: "Claude or Codex answers with cards; turn it on in Spotlight Settings > AI", icon: "\uDB81\uDEA9" },
  { section: "Ask AI", example: "ai: weather in Madrid", what: "Weather, maps, charts, timelines and other visual answers", icon: "\uDB81\uDEA9" },
  { section: "Spotlight", example: "spotlight settings", what: "Sources, appearance (opacity, blur), shortcut and AI", icon: "\uDB81\uDC93" },
  { section: "Spotlight", example: "? currency", what: "This cheatsheet; type after ? or help: to filter it", icon: "\uDB80\uDEFC" },
  { section: "Keys", example: "Up / Down", what: "Select a result", icon: "\uDB80\uDF0C", key: true },
  { section: "Keys", example: "Enter", what: "Main action", icon: "\uDB80\uDF0C", key: true },
  { section: "Keys", example: "Shift+Enter", what: "Secondary action, when the result has one", icon: "\uDB80\uDF0C", key: true },
  { section: "Keys", example: "Tab", what: "Complete a view name or folder", icon: "\uDB80\uDF0C", key: true },
  { section: "Keys", example: "Right / Left", what: "Browse into a folder in the preview pane, and back", icon: "\uDB80\uDF0C", key: true },
  { section: "Keys", example: "Esc", what: "Clear the query, then close Spotlight", icon: "\uDB80\uDF0C", key: true }
]

function entries(query) {
  var words = String(query || "").toLowerCase().split(/\s+/).filter(function(w) { return w.length > 0 })
  return ENTRIES.filter(function(entry) {
    var haystack = (entry.section + " " + entry.example + " " + entry.what).toLowerCase()
    for (var i = 0; i < words.length; i++)
      if (haystack.indexOf(words[i]) < 0) return false
    return true
  })
}

if (typeof module !== "undefined") module.exports = { ENTRIES: ENTRIES, entries: entries }
