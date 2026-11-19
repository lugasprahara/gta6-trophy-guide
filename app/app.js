// Leonida Platinum Desk — offline trophy guide + tracker.
// All data lives in data/trophies.json. Progress lives only in this browser (localStorage).
const KEY = "leonida-platinum-desk-v1";
const DEMO_EARNED = [2, 3, 4, 8, 10, 20, 21, 28, 29, 33, 44, 46, 51];
const DEMO_COUNTERS = { 15: 96, 17: 19, 18: 6, 31: 37, 35: 41, 42: 23, 52: 84500, 53: 41200 };
const STAGES = [
  { n: 1, title: "Story first — the opening and the chapters", blurb: "Play the story in order: the opening mission, Chapters 1–4 and the named story missions. These unlock in the story flow and cannot be missed by exploring first." },
  { n: 2, title: "Stranger strands & the partner", blurb: "The side-story mission lines — Andy, Kenton, Billy, Randy and Tyrone — plus the partner trophies. Eight stranger strands in total close the silver Strangers & Freaks." },
  { n: 3, title: "Activities & skills", blurb: "Stunts, the Shooting Range, drone races, races, fishing, the arcade, meditation, hunting and the challenge lists. Long grinds that run well alongside everything else." },
  { n: 4, title: "Collectibles & exploring Leonida", blurb: "Card sets, WAiNK locations, vehicles to discover and register, and all 52 areas of Leonida — plus the one-off world moments (the airport, the showroom, Ocean Beach)." },
  { n: 5, title: "Money & mop-up", blurb: "Bank vaults, laundering Marked Bills, spending across shops, garage properties, story choices and the second-try trophy. Finish the money counters here." },
  { n: 6, title: "The finish — final mission & 100%", blurb: "The final mission (gold), 100% completion (gold) and the platinum itself, which unlocks once the other 54 are earned." },
];
const KIND_LABEL = { story: "Story", collectibles: "Collectibles", activities: "Activities", world: "World" };

const doc = await (await fetch("data/trophies.json")).json();
const trophies = doc.trophies;

let state = load();
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return { earned: new Set(s.earned || []), counters: s.counters || {}, notes: s.notes || {}, spoilers: !!s.spoilers };
    }
  } catch { /* corrupted save: start fresh */ }
  return { earned: new Set(), counters: {}, notes: {}, spoilers: false };
}
function save() {
  localStorage.setItem(KEY, JSON.stringify({
    earned: [...state.earned], counters: state.counters, notes: state.notes, spoilers: state.spoilers,
  }));
}
const params = new URLSearchParams(location.search);
if (params.get("demo") === "1" && state.earned.size === 0) {
  state.earned = new Set(DEMO_EARNED.map((id) => byId(id).name));
  state.counters = { ...DEMO_COUNTERS };
  save();
  document.getElementById("demoNote").hidden = false;
}
function byId(id) { return trophies.find((t) => t.id === id); }
function isEarned(t) { return state.earned.has(t.name); }
function counterOf(t) { return t.target ? Math.min(t.target, state.counters[t.id] || 0) : 0; }
function fmt(n) { return n.toLocaleString("en-US"); }

let selectedId = null;
const $ = (id) => document.getElementById(id);

// ---------- header progress ----------
function renderProgress() {
  const earned = state.earned.size;
  $("earnedCount").textContent = earned;
  const pct = Math.round((earned / trophies.length) * 100);
  $("progressFill").style.width = pct + "%";
  $("pctText").textContent = pct + "% to platinum";
  const counts = {};
  for (const t of trophies) if (isEarned(t)) counts[t.grade] = (counts[t.grade] || 0) + 1;
  $("gradeCounts").textContent = ["platinum", "gold", "silver", "bronze"]
    .map((g) => `${counts[g] || 0} ${g}`).join(" · ");
  $("missCount").textContent = trophies.filter((t) => t.missable).length;
}

// ---------- tracker list ----------
function visibleTrophies() {
  const q = $("q").value.trim().toLowerCase();
  const grade = $("grade").value, kind = $("kind").value, status = $("status").value;
  return trophies.filter((t) => {
    if (grade !== "all" && t.grade !== grade) return false;
    if (kind === "missable") { if (!t.missable) return false; }
    else if (kind !== "all" && t.kind !== kind) return false;
    if (status === "earned" && !isEarned(t)) return false;
    if (status === "unearned" && isEarned(t)) return false;
    if (q && !(t.name + " " + t.description).toLowerCase().includes(q)) return false;
    return true;
  });
}
function spoilerHidden(t) { return state.spoilers && t.kind === "story" && !isEarned(t); }

function renderList() {
  const list = visibleTrophies();
  const ul = $("trophyList");
  ul.replaceChildren();
  $("emptyMsg").hidden = list.length > 0;
  $("filterHint").textContent = `Showing ${list.length} of 55 trophies` +
    (state.spoilers ? " · spoiler setting on: story trophies stay hidden until earned" : "");
  for (const t of list) {
    const li = document.createElement("li");
    li.className = isEarned(t) ? "earned" : "";
    if (selectedId === t.id) li.classList.add("selected");
    const box = document.createElement("input");
    box.type = "checkbox"; box.checked = isEarned(t);
    box.setAttribute("aria-label", "Earned: " + t.name);
    box.addEventListener("change", (e) => {
      e.stopPropagation();
      if (box.checked) state.earned.add(t.name); else state.earned.delete(t.name);
      save(); renderAll();
    });
    const body = document.createElement("div"); body.className = "body";
    const name = document.createElement("div"); name.className = "name";
    name.textContent = spoilerHidden(t) ? "Hidden story trophy" : t.name;
    const desc = document.createElement("div"); desc.className = "desc";
    desc.textContent = spoilerHidden(t)
      ? "Hidden until earned — turn the spoiler setting off or earn it to reveal it."
      : t.description;
    const meta = document.createElement("div"); meta.className = "meta";
    const chip = (cls, text) => { const s = document.createElement("span"); s.className = "chip " + cls; s.textContent = text; return s; };
    meta.append(chip(t.grade, t.grade), chip("", KIND_LABEL[t.kind] || t.kind));
    if (t.missable) meta.append(chip("miss", "Possibly missable"));
    if (t.target) {
      const c = document.createElement("span"); c.className = "counter";
      c.textContent = t.target >= 1000
        ? `$${fmt(counterOf(t))} / $${fmt(t.target)}`
        : `${fmt(counterOf(t))} / ${fmt(t.target)} ${t.target_unit}`;
      meta.append(c);
    }
    body.append(name, desc, meta);
    li.append(box, body);
    li.addEventListener("click", (e) => { if (e.target !== box) { selectedId = t.id; renderAll(); } });
    ul.append(li);
  }
}

// ---------- detail pane ----------
function renderDetail() {
  const d = $("detail");
  const t = selectedId ? byId(selectedId) : null;
  if (!t) { d.innerHTML = '<p class="detailEmpty">Select a trophy on the left to open its full guide — what to do, when in the story, and whether it can be missed — with its sources.</p>'; return; }
  d.replaceChildren();
  const h = document.createElement("h2");
  h.textContent = spoilerHidden(t) ? "Hidden story trophy" : t.name;
  const off = document.createElement("p"); off.className = "official";
  off.textContent = spoilerHidden(t)
    ? "Official name and description hidden by the spoiler setting until this trophy is earned."
    : `“${t.description}” — official description · ${t.grade} trophy`;
  d.append(h, off);
  if (t.missable) {
    const m = document.createElement("div"); m.className = "missNote";
    m.innerHTML = "<strong>Possibly missable — inferred, not yet verified in the game.</strong> ";
    m.append(document.createTextNode(t.missable_reason));
    d.append(m);
  }
  const gh = document.createElement("h3"); gh.textContent = "Guide";
  const g = document.createElement("p");
  g.textContent = spoilerHidden(t)
    ? "The guide is hidden with the trophy until it is earned."
    : t.guide.replace(/ Sources:.*$/, "");
  const src = document.createElement("div"); src.className = "sources";
  src.textContent = spoilerHidden(t)
    ? "Sources hidden with the trophy until it is earned."
    : t.sources;
  d.append(gh, g, src);
  if (t.target) {
    const ch = document.createElement("h3"); ch.textContent = "Progress counter";
    const row = document.createElement("div"); row.className = "stepper";
    const minus = document.createElement("button"); minus.type = "button"; minus.textContent = "−";
    const val = document.createElement("span"); val.className = "val";
    const plus = document.createElement("button"); plus.type = "button"; plus.textContent = "+";
    const setVal = () => {
      val.textContent = t.target >= 1000
        ? `$${fmt(counterOf(t))} / $${fmt(t.target)}`
        : `${fmt(counterOf(t))} / ${fmt(t.target)} ${t.target_unit}`;
    };
    setVal();
    minus.addEventListener("click", () => { state.counters[t.id] = Math.max(0, counterOf(t) - 1); save(); renderAll(); });
    plus.addEventListener("click", () => { state.counters[t.id] = Math.min(t.target, counterOf(t) + 1); save(); renderAll(); });
    row.append(minus, val, plus);
    const lab = document.createElement("p"); lab.textContent = t.target_label + ". Counts come from the official description and PSN's target.";
    d.append(ch, row, lab);
  }
  const nh = document.createElement("h3"); nh.textContent = "Your note";
  const note = document.createElement("textarea");
  note.className = "noteBox"; note.placeholder = "Your own note for this trophy — a reminder, a plan, anything. Saved in this browser only.";
  note.value = state.notes[t.id] || "";
  note.addEventListener("input", () => { state.notes[t.id] = note.value; save(); });
  const eb = document.createElement("p");
  const earnBtn = document.createElement("button"); earnBtn.type = "button";
  earnBtn.textContent = isEarned(t) ? "Mark as not earned" : "Mark as earned";
  earnBtn.addEventListener("click", () => {
    if (isEarned(t)) state.earned.delete(t.name); else state.earned.add(t.name);
    save(); renderAll();
  });
  eb.append(earnBtn);
  d.append(nh, note, eb);
}

// ---------- roadmap ----------
function renderRoadmap() {
  const wrap = $("roadmapStages");
  wrap.replaceChildren();
  for (const s of STAGES) {
    const ts = trophies.filter((t) => t.stage === s.n);
    const done = ts.filter(isEarned).length;
    const div = document.createElement("div"); div.className = "stage";
    const h = document.createElement("h3");
    h.textContent = `Stage ${s.n} — ${s.title} (${done}/${ts.length})`;
    const p = document.createElement("p"); p.textContent = s.blurb;
    const bar = document.createElement("div"); bar.className = "stageBar";
    const fill = document.createElement("div"); fill.style.width = Math.round((done / ts.length) * 100) + "%";
    bar.append(fill);
    const ul = document.createElement("ul");
    for (const t of ts) {
      const li = document.createElement("li");
      li.textContent = (spoilerHidden(t) ? "Hidden story trophy" : t.name) + (t.target ? ` — ${fmt(counterOf(t))}/${fmt(t.target)}` : "");
      if (isEarned(t)) li.className = "done";
      li.style.cursor = "pointer";
      li.addEventListener("click", () => { selectedId = t.id; location.hash = "#/tracker"; renderAll(); });
      ul.append(li);
    }
    div.append(h, p, bar, ul);
    wrap.append(div);
  }
}

// ---------- missables ----------
function renderMissables() {
  const wrap = $("missableList");
  wrap.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const div = document.createElement("div"); div.className = "missCard";
    const h = document.createElement("h3");
    h.textContent = t.name + ` — ${t.grade} trophy` + (isEarned(t) ? " · earned ✓" : "");
    const q = document.createElement("blockquote");
    q.textContent = `Official description: “${t.description}”`;
    const r = document.createElement("p");
    r.textContent = "Why it is flagged: " + t.missable_reason;
    const open = document.createElement("button"); open.type = "button"; open.textContent = "Open its guide";
    open.addEventListener("click", () => { selectedId = t.id; location.hash = "#/tracker"; renderAll(); });
    div.append(h, q, r, open);
    wrap.append(div);
  }
}

// ---------- next up ----------
function renderNextUp() {
  const wrap = $("nextList");
  wrap.replaceChildren();
  const open = trophies.filter((t) => !isEarned(t));
  const remaining = (t) => (t.target ? (t.target - counterOf(t)) / t.target : 0.5);
  open.sort((a, b) => a.stage - b.stage || remaining(a) - remaining(b) || a.name.localeCompare(b.name));
  open.slice(0, 12).forEach((t, i) => {
    const li = document.createElement("li");
    const rank = document.createElement("span"); rank.className = "rank"; rank.textContent = (i + 1) + ".";
    const body = document.createElement("div");
    const name = document.createElement("div"); name.style.fontWeight = "700";
    name.textContent = spoilerHidden(t) ? "Hidden story trophy" : t.name;
    const why = document.createElement("div"); why.className = "why";
    why.textContent = `Stage ${t.stage} · ${STAGES[t.stage - 1].title}` +
      (t.target ? ` · ${fmt(t.target - counterOf(t))} ${t.target_unit} left` : "") +
      (t.missable ? " · possibly missable — do it before moving on" : "");
    body.append(name, why);
    li.append(rank, body);
    li.addEventListener("click", () => { selectedId = t.id; location.hash = "#/tracker"; renderAll(); });
    wrap.append(li);
  });
  if (open.length === 0) wrap.innerHTML = "<li>Everything is earned — the platinum is yours, Leonida Legend.</li>";
}

// ---------- routing / wiring ----------
function renderAll() { renderProgress(); renderList(); renderDetail(); renderRoadmap(); renderMissables(); renderNextUp(); }
function route() {
  const view = (location.hash.match(/#\/(\w+)/) || [])[1] || "tracker";
  document.querySelectorAll(".view").forEach((v) => { v.hidden = v.id !== "view-" + view; });
  document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("active", a.dataset.view === view));
}
window.addEventListener("hashchange", route);

$("q").addEventListener("input", renderList);
$("grade").addEventListener("change", renderList);
$("kind").addEventListener("change", renderList);
$("status").addEventListener("change", renderList);
$("spoilers").checked = state.spoilers;
$("spoilers").addEventListener("change", (e) => { state.spoilers = e.target.checked; save(); renderAll(); });
$("exportBtn").addEventListener("click", () => {
  const data = { app: "Leonida Platinum Desk", exportedAt: new Date().toISOString(), earned: [...state.earned], counters: state.counters, notes: state.notes, spoilers: state.spoilers };
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = "leonida-platinum-progress.json"; a.click();
  URL.revokeObjectURL(a.href);
});
$("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = new Set(trophies.map((t) => t.name));
    state.earned = new Set((data.earned || []).filter((n) => names.has(n)));
    state.counters = {}; state.notes = {};
    for (const t of trophies) {
      if (data.counters && Number.isFinite(data.counters[t.id])) state.counters[t.id] = Math.max(0, Math.min(t.target || 0, data.counters[t.id]));
      if (data.notes && typeof data.notes[t.id] === "string") state.notes[t.id] = data.notes[t.id];
    }
    state.spoilers = !!data.spoilers;
    $("spoilers").checked = state.spoilers;
    save(); renderAll();
  } catch { alert("That file could not be imported — it is not a Leonida Platinum Desk progress file."); }
  e.target.value = "";
});
$("resetBtn").addEventListener("click", () => {
  if (!confirm("Clear all earned ticks, counters and notes on this device?")) return;
  state = { earned: new Set(), counters: {}, notes: {}, spoilers: false };
  $("spoilers").checked = false; selectedId = null;
  save(); renderAll();
});
$("aboutSources").addEventListener("click", () => $("sourcesDialog").showModal());

route();
renderAll();
