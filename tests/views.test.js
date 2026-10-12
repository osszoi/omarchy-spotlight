const assert = require("node:assert/strict")
const test = require("node:test")
const Fuzzy = require("../lib/Fuzzy.js")
const Query = require("../lib/Query.js")
const Views = require("../lib/Views.js")

const ready = (entries, partial = false) => ({ state: "ready", entries, partial })
const rows = (name, view, q = "") => Views.rows(name, Query.viewDetails(name), view, q, Fuzzy.match)

const sockets = [
  { process: "postgres", endpoint: "127.0.0.1:5432", port: 5432, protocol: "TCP", pid: 1220,
    url: "http://127.0.0.1:5432" },
  { process: "sshd", endpoint: "0.0.0.0:22", port: 22, protocol: "TCP", pid: 842,
    url: "http://localhost:22" },
  { process: "node", endpoint: "127.0.0.1:2222", port: 2222, protocol: "TCP", pid: 22,
    url: "http://127.0.0.1:2222" },
  { process: "", endpoint: "[::]:5353", port: 5353, protocol: "UDP", pid: null, url: "" }
]

test("every view has a spec and every spec a view", () => {
  assert.deepEqual(Object.keys(Views.SPECS).sort(), Object.keys(Query.VIEWS).sort())
})

test("views show status rows until their list is ready", () => {
  const loading = rows("ports", { state: "loading", entries: [] })
  assert.deepEqual(loading.map(r => [r.kind, r.title, r.section]),
    [["noop", "Loading listening ports…", "Listening ports"]])
  assert.equal(rows("docker", { state: "error" })[0].title, "Docker unavailable · check daemon access")
  assert.equal(rows("mounts", { state: "error" })[0].title, "Mounts unavailable")
  assert.equal(rows("services", ready([]))[0].title, "No loaded services")
  assert.equal(rows("mounts", ready([]))[0].title, "No mounts")
  assert.equal(rows("mounts", ready([], true))[0].title, "Could not list all mounts")
  const mounts = [{ target: "/", source: "/dev/sda1", fstype: "ext4" }]
  assert.equal(rows("mounts", ready(mounts), "zzz")[0].title, "No matching mounts")
  assert.equal(rows("mounts", ready(mounts, true))[0].section, "Mounted filesystems · partial list")
})

test("ports rank exact numbers first and still match names and abbreviations", () => {
  const ports = (q) => rows("ports", ready(sockets), q).map(r => r.subtitle.split(" ")[0])
  assert.deepEqual(ports("postg"), ["127.0.0.1:5432"])
  assert.deepEqual(ports("ssh"), ["0.0.0.0:22"])
  assert.deepEqual(ports("psgr"), ["127.0.0.1:5432"])
  assert.equal(ports("22")[0], "0.0.0.0:22")
  assert.equal(rows("ports", ready(sockets)).length, sockets.length)
})

test("Enter opens TCP listeners, copies UDP ones, and Shift+Enter always copies", () => {
  const [tcp] = rows("ports", ready(sockets), "postgres")
  const [udp] = rows("ports", ready(sockets), "5353")
  assert.equal(tcp.primaryLabel, "Open URL")
  assert.equal(udp.primaryLabel, "Copy endpoint")
  assert.deepEqual(Views.action("ports", tcp.payload, false), { url: "http://127.0.0.1:5432" })
  assert.deepEqual(Views.action("ports", tcp.payload, true), { copy: "127.0.0.1:5432" })
  assert.deepEqual(Views.action("ports", udp.payload, false), { copy: "[::]:5353" })
})

test("ssh offers a direct connection for a safe host that is not saved", () => {
  const hosts = [{ name: "prod", source: "config" }, { name: "lab", source: "known_hosts" }]
  assert.deepEqual(rows("ssh", ready(hosts), "prod").map(r => r.key), ["ssh:prod"])
  assert.deepEqual(rows("ssh", ready(hosts), "PROD").map(r => r.key), ["ssh:prod"])
  // A saved host that merely contains the typed one must not hide it.
  const near = [{ name: "prod-db", source: "config" }, { name: "10.0.0.12", source: "known_hosts" }]
  assert.deepEqual(rows("ssh", ready(near), "10.0.0.1").map(r => r.key),
    ["ssh:10.0.0.12", "ssh.direct:10.0.0.1"])
  assert.deepEqual(rows("ssh", ready(near.concat(hosts)), "prod").map(r => r.key), ["ssh:prod", "ssh:prod-db"])
  const [direct] = rows("ssh", ready(hosts), "root@box.example")
  assert.equal(direct.kind, "ssh")
  assert.equal(direct.payload.host, "root@box.example")
  for (const unsafe of ["-oProxyCommand=x", "x y", "@host"])
    assert.equal(rows("ssh", ready(hosts), unsafe)[0].kind, "noop", unsafe)
  assert.equal(rows("ssh", ready([]))[0].title, "No saved SSH hosts · type a hostname")
  assert.deepEqual(Views.action("ssh", direct.payload, false),
    { terminal: ["ssh", "root@box.example"], holdIf: 255 })
  assert.deepEqual(Views.action("ssh", direct.payload, true), { copy: "ssh root@box.example" })
})

test("Bluetooth disconnects need confirmation; connecting does not", () => {
  const devices = [
    { address: "00:11:22:33:44:55", name: "Headphones", connected: true },
    { address: "66:77:88:99:AA:BB", name: "Keyboard", connected: false }
  ]
  const [connected, paired, manage] = rows("bluetooth", ready(devices))
  assert.equal(connected.confirm, true)
  assert.equal(paired.confirm, false)
  assert.deepEqual(Views.action("bluetooth", connected.payload, false),
    { argv: ["omarchy-bluetooth-device", "disconnect", "00:11:22:33:44:55"] })
  assert.deepEqual(Views.action("bluetooth", paired.payload, true),
    { argv: ["omarchy-bluetooth-device", "connect", "66:77:88:99:AA:BB"] })
  assert.equal(manage.kind, "shell")
  assert.equal(connected.section, "Paired Bluetooth devices")
})

test("Wi-Fi keeps option-like SSIDs away from nmcli and manages from the panel", () => {
  const networks = [
    { ssid: "Home", connected: false, signal: 80, security: "WPA2" },
    { ssid: "-oops", connected: false, signal: 40, security: "" }
  ]
  const list = rows("wifi", ready(networks))
  assert.deepEqual(list.map(r => r.key), ["wifi:Home", "wifi:-oops", "wifi.manage"])
  assert.deepEqual(Views.action("wifi", list[0].payload, false),
    { terminal: ["nmcli", "--ask", "device", "wifi", "connect", "Home"] })
  assert.deepEqual(Views.action("wifi", list[1].payload, false),
    { argv: ["omarchy-shell", "omarchy.network", "show"] })
  assert.equal(list[1].primaryLabel, "Manage network")
  assert.equal(list[2].title, "Manage Wi-Fi…")
  assert.deepEqual(rows("wifi", ready(networks), "home").map(r => r.key), ["wifi:Home"])
  assert.deepEqual(rows("wifi", ready([])).map(r => [r.kind, r.title]),
    [["shell", "No Wi-Fi networks · open Network panel"]])
})

test("audio lists outputs before inputs under a query and leaves the default alone", () => {
  const devices = [
    { kind: "output", name: "speaker", description: "USB Speaker", default: true },
    { kind: "input", name: "usb-mic", description: "USB Microphone", default: false },
    { kind: "output", name: "hdmi", description: "HDMI USB bridge", default: false }
  ]
  const list = rows("audio", ready(devices), "usb")
  assert.deepEqual(list.map(r => r.section), ["Audio outputs", "Audio outputs", "Audio inputs"])
  assert.equal(list[2].icon, "󰍬")
  assert.equal(list[0].icon, Query.viewDetails("audio").icon)
  assert.equal(Views.action("audio", list[0].payload, false), null)
  assert.deepEqual(Views.action("audio", list[2].payload, false),
    { argv: ["pactl", "set-default-source", "usb-mic"] })
  // With a PipeWire node id, Omarchy's setter also moves the playing streams.
  const [hdmi] = rows("audio", ready([{ ...devices[2], id: "57" }]))
  assert.deepEqual(Views.action("audio", hdmi.payload, false),
    { argv: ["omarchy-audio-output-set-default", "57", "hdmi"] })
  const [mic] = rows("audio", ready([{ ...devices[1], id: "83" }]))
  assert.deepEqual(Views.action("audio", mic.payload, false),
    { argv: ["omarchy-audio-input-set-default", "83", "usb-mic"] })
})

test("repeated keys are dropped and at most one extra row is added", () => {
  const mounts = [
    { target: "/mnt/x", source: "/dev/sda1", fstype: "ext4" },
    { target: "/mnt/x", source: "/dev/sdb1", fstype: "xfs" }
  ]
  const list = rows("mounts", ready(mounts))
  assert.deepEqual(list.map(r => r.key), ["mount:/mnt/x"])
  assert.equal(list[0].kind, "mounts")
  assert.deepEqual(Views.action("mounts", list[0].payload, false), { path: "/mnt/x" })
  const devices = Array.from({ length: 200 }, (_, i) =>
    ({ address: `00:00:00:00:00:${String(i).padStart(2, "0")}`, name: `Device ${i}`, connected: false }))
  assert.equal(rows("bluetooth", ready(devices)).length, 201)
  assert.equal(Views.action("unknown", {}, false), null)
})

const repos = [
  { name: "Dawere/backend-api", description: "Dawere's BackEnd", private: true, archived: false,
    url: "https://github.com/Dawere/backend-api", pushed: "2026-10-12T18:00:00Z" },
  { name: "osszoi/omarchy-spotlight", description: "", private: false, archived: false,
    url: "https://github.com/osszoi/omarchy-spotlight", pushed: "2026-10-11T18:00:00Z" },
  { name: "osszoi/old-pipeline", description: "", private: false, archived: true,
    url: "https://github.com/osszoi/old-pipeline", pushed: "2020-01-01T00:00:00Z" }
]
const prs = [
  { repo: "Dawere/backend-api", number: 1402, title: "feat: enrolment events", author: "pedro",
    url: "https://github.com/Dawere/backend-api/pull/1402", updated: "2026-10-12T18:31:11Z", draft: false },
  { repo: "Dawere/e2e", number: 1, title: "Bump brace-expansion", author: "dependabot[bot]",
    url: "https://github.com/Dawere/e2e/pull/1", updated: "2026-10-12T17:00:00Z", draft: true }
]

test("gh: keeps only repos whose name contains the text, no fuzzy matches", () => {
  assert.deepEqual(rows("gh", ready(repos), "api").map(r => r.title), ["Dawere/backend-api"])
  assert.deepEqual(rows("gh", ready(repos), "OSSZOI/").map(r => r.title),
    ["osszoi/omarchy-spotlight", "osszoi/old-pipeline"])
  assert.equal(rows("gh", ready(repos), "zzz")[0].title, "No matching repositories")
  const archived = rows("gh", ready(repos)).find(r => r.title === "osszoi/old-pipeline")
  assert.equal(archived.accessory, "Archived")
  assert.deepEqual(Views.action("gh", archived.payload, false), { url: "https://github.com/osszoi/old-pipeline" })
  assert.deepEqual(Views.action("gh", archived.payload, true), { copy: "https://github.com/osszoi/old-pipeline" })
})

test("pr: filters by title, repo, author or number and opens the PR", () => {
  assert.deepEqual(rows("pr", ready(prs), "dependabot").map(r => r.title), ["Bump brace-expansion"])
  assert.deepEqual(rows("pr", ready(prs), "#1402").map(r => r.title), ["feat: enrolment events"])
  assert.deepEqual(rows("pr", ready(prs), "e2e").map(r => r.accessory), ["Draft"])
  const first = rows("pr", ready(prs))[0]
  assert.match(first.subtitle, /^Dawere\/backend-api #1402 · pedro · /)
  assert.deepEqual(Views.action("pr", first.payload, false), { url: "https://github.com/Dawere/backend-api/pull/1402" })
  assert.equal(rows("pr", { state: "error" })[0].title, "GitHub CLI unavailable · check gh auth status")
})

test("a cached list says it is refreshing", () => {
  const view = { state: "ready", entries: prs, partial: false, note: "updating…" }
  assert.equal(rows("pr", view)[0].section, "Open pull requests · updating…")
})

test("ago reads like a person would say it", () => {
  const now = Date.parse("2026-10-12T12:00:00Z")
  assert.equal(Views.ago("2026-10-12T11:59:40Z", now), "just now")
  assert.equal(Views.ago("2026-10-12T11:15:00Z", now), "45m ago")
  assert.equal(Views.ago("2026-10-12T07:00:00Z", now), "5h ago")
  assert.equal(Views.ago("2026-10-09T12:00:00Z", now), "3d ago")
  assert.equal(Views.ago("2026-06-12T12:00:00Z", now), "4mo ago")
  assert.equal(Views.ago("2021-05-07T01:52:09Z", now), "5y ago")
  assert.equal(Views.ago("", now), "")
})
