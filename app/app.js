// Leonida Platinum Desk — an offline GTA 6 trophy guide and tracker.
// Loads app/data/trophies.json, renders the checklist / roadmap / missables views,
// and keeps earned trophies in localStorage. No network use at run time: the only
// fetch is the local data file, and the further-reading links open only on click.

const PROGRESS_KEY = 'leonida-platinum-desk-progress-v1';
const SPOILER_KEY = 'leonida-platinum-desk-spoilers-v1';

// A small sample set shown with ?demo=1 so the guide can be previewed (and
// screenshotted) with progress visible. It only applies when nothing is saved yet.
const DEMO_EARNED = [2, 3, 8, 10, 15, 16, 19, 21, 28, 32, 33, 46];

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  platinum: 'Platinum',
};
const KIND_ORDER = ['story', 'missable', 'collectibles', 'activities', 'online', 'platinum'];

const searchInput = document.getElementById('search');
const spoilersInput = document.getElementById('spoilers');
const gradeSelect = document.getElementById('grade');
const stateSelect = document.getElementById('state');
const kindsBox = document.getElementById('kinds');
const cardsBox = document.getElementById('cards');
const emptyNote = document.getElementById('empty');
const resultCount = document.getElementById('resultCount');
const nextupBox = document.getElementById('nextup');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const progressByGrade = document.getElementById('progressByGrade');
const missableCountBadge = document.getElementById('missableCount');

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const sourceText = data.sources ?? {};
const roadmap = data.roadmap ?? [];
const furtherReading = data.furtherReading ?? [];

const byId = new Map(trophies.map((t) => [t.id, t]));
const missables = trophies.filter((t) => t.missable);
missableCountBadge.textContent = String(missables.length);

// ---- saved progress -------------------------------------------------------
function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? 'null');
    if (Array.isArray(saved)) return new Set(saved.filter((id) => byId.has(id)));
  } catch {
    // A corrupt save is treated as empty rather than crashing the page.
  }
  if (new URLSearchParams(location.search).get('demo') === '1') {
    return new Set(DEMO_EARNED);
  }
  return new Set();
}
let earned = loadProgress();
function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

// Spoilers hide story trophies' names and descriptions until they are earned.
let spoilersOn = localStorage.getItem(SPOILER_KEY) !== '0';
spoilersInput.checked = spoilersOn;
spoilersInput.addEventListener('change', () => {
  spoilersOn = spoilersInput.checked;
  localStorage.setItem(SPOILER_KEY, spoilersOn ? '1' : '0');
  renderList();
});

let activeKind = 'all';
let openGuideId = null;

function isSpoilerHidden(t) {
  return spoilersOn && t.kind === 'story' && !earned.has(t.id);
}

function gradeWord(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function trophyMatches(t) {
  const q = searchInput.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (gradeSelect.value !== 'all' && t.grade !== gradeSelect.value) return false;
  if (stateSelect.value === 'earned' && !earned.has(t.id)) return false;
  if (stateSelect.value === 'remaining' && earned.has(t.id)) return false;
  if (activeKind === 'missable' && !t.missable) return false;
  if (activeKind === 'online') return false; // No online trophies in this list.
  if (activeKind !== 'all' && activeKind !== 'missable' && t.kind !== activeKind) return false;
  return true;
}

function sourceNames(keys) {
  return (keys ?? ['official']).map((k) => sourceText[k] ?? k);
}

// ---- checklist ------------------------------------------------------------
function buildCard(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.id) ? ' earned' : '') + (t.missable ? ' missable-card' : '');
  if (openGuideId === t.id) card.classList.add('open');
  card.id = `trophy-${t.id}`;

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveProgress();
    renderAll();
  });
  head.append(box);

  const titleWrap = document.createElement('div');
  titleWrap.className = 'card-title';
  const title = document.createElement('h3');
  if (isSpoilerHidden(t)) {
    title.textContent = 'Hidden story trophy — earn it to reveal';
    title.classList.add('spoiler-hidden');
  } else {
    const link = document.createElement('a');
    link.href = `#/guide/${t.id}`;
    link.textContent = t.name;
    title.append(link);
  }
  titleWrap.append(title);
  head.append(titleWrap);

  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = gradeWord(t.grade);
  head.append(badge);
  card.append(head);

  if (!isSpoilerHidden(t)) {
    const desc = document.createElement('p');
    desc.className = 'official-desc';
    desc.textContent = t.description;
    card.append(desc);
  }

  const tags = document.createElement('div');
  tags.className = 'tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[t.kind] ?? t.kind;
  tags.append(kindTag);
  const stageTag = document.createElement('span');
  stageTag.className = 'tag stage-tag';
  stageTag.textContent = `Roadmap stage ${t.stage}`;
  tags.append(stageTag);
  if (t.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable-tag';
    missTag.textContent = 'Missable';
    tags.append(missTag);
  }
  card.append(tags);

  if (typeof t.count === 'number') {
    const countLine = document.createElement('p');
    countLine.className = 'count-line';
    countLine.textContent = `Target: ${t.count.toLocaleString('en-US')}`;
    card.append(countLine);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.textContent = openGuideId === t.id ? 'Hide guide ▲' : 'Read the guide ▼';
  toggle.addEventListener('click', () => {
    openGuideId = openGuideId === t.id ? null : t.id;
    renderList();
    if (openGuideId === t.id) {
      document.getElementById(`trophy-${t.id}`)?.scrollIntoView({ block: 'nearest' });
    }
  });
  card.append(toggle);

  if (openGuideId === t.id) {
    const guide = document.createElement('div');
    guide.className = 'guide';
    if (t.missable && t.missableNote) {
      const note = document.createElement('p');
      note.className = 'missable-note';
      note.textContent = `⚠ Missable: ${t.missableNote}`;
      guide.append(note);
    }
    const body = document.createElement('p');
    body.textContent = t.guide;
    guide.append(body);
    if (Array.isArray(t.steps) && t.steps.length > 0) {
      const stepsHead = document.createElement('h4');
      stepsHead.textContent = 'How to get it';
      guide.append(stepsHead);
      const steps = document.createElement('ol');
      for (const step of t.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        steps.append(li);
      }
      guide.append(steps);
    }
    const sources = document.createElement('p');
    sources.className = 'sources';
    const strong = document.createElement('strong');
    strong.textContent = 'Sources: ';
    sources.append(strong);
    sources.append(sourceNames(t.sources).join(' · '));
    guide.append(sources);
    card.append(guide);
  }
  return card;
}

function renderKindChips() {
  kindsBox.replaceChildren();
  const counts = { all: trophies.length, online: 0 };
  for (const t of trophies) {
    counts[t.kind] = (counts[t.kind] ?? 0) + 1;
    if (t.missable) counts.missable = (counts.missable ?? 0) + 1;
  }
  for (const kind of ['all', ...KIND_ORDER]) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.setAttribute('aria-pressed', String(activeKind === kind));
    chip.textContent = kind === 'all' ? 'All trophies' : KIND_LABELS[kind];
    const n = document.createElement('span');
    n.className = 'chip-count';
    n.textContent = `(${counts[kind] ?? 0})`;
    chip.append(n);
    chip.addEventListener('click', () => {
      activeKind = kind;
      renderKindChips();
      renderList();
    });
    kindsBox.append(chip);
  }
}

function renderNextUp() {
  nextupBox.replaceChildren();
  const remaining = trophies.filter((t) => !earned.has(t.id));
  if (remaining.length === 0) {
    nextupBox.classList.add('done');
    const h = document.createElement('h3');
    h.textContent = 'Platinum complete — Vice Got a Price!';
    nextupBox.append(h);
    const p = document.createElement('p');
    p.textContent = 'Every trophy is ticked. Export your progress to keep a copy.';
    nextupBox.append(p);
    return;
  }
  nextupBox.classList.remove('done');
  const h = document.createElement('h3');
  h.textContent = 'Next up — ';
  nextupBox.append(h);
  const p = document.createElement('p');
  p.textContent = 'Next in the roadmap: ';
  // Show the next trophies in roadmap order. Spoiler-hidden ones all look the
  // same, so show at most one of them and fill the rest with visible trophies.
  const picks = [];
  let hiddenShown = false;
  for (const t of [...remaining].sort((a, b) => a.stage - b.stage || a.id - b.id)) {
    if (picks.length >= 3) break;
    if (isSpoilerHidden(t)) {
      if (hiddenShown) continue;
      hiddenShown = true;
    }
    picks.push(t);
  }
  picks.forEach((t, i) => {
    if (i > 0) p.append(document.createTextNode(' · '));
    if (isSpoilerHidden(t)) {
      const span = document.createElement('span');
      span.textContent = `a hidden story trophy (stage ${t.stage})`;
      p.append(span);
    } else {
      const link = document.createElement('a');
      link.href = `#/guide/${t.id}`;
      link.textContent = t.name;
      p.append(link);
      p.append(` (stage ${t.stage})`);
    }
  });
  nextupBox.append(p);
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  progressText.textContent = `${done} of ${total} earned`;
  progressPct.textContent = `${Math.round((done / total) * 100)}%`;
  progressFill.style.width = `${(done / total) * 100}%`;
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const inGrade = trophies.filter((t) => t.grade === g);
    const got = inGrade.filter((t) => earned.has(t.id)).length;
    return `${gradeWord(g)} ${got}/${inGrade.length}`;
  });
  progressByGrade.textContent = byGrade.join(' · ');
}

function renderList() {
  const shown = trophies.filter(trophyMatches);
  // The open guide leads the list, so a deep-linked guide is visible with the
  // masthead, progress and filters still on screen above it.
  shown.sort((a, b) => (a.id === openGuideId ? -1 : 0) - (b.id === openGuideId ? -1 : 0));
  cardsBox.replaceChildren(...shown.map(buildCard));
  emptyNote.hidden = shown.length !== 0;
  resultCount.textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
  renderProgress();
  renderNextUp();
}

// ---- roadmap view ---------------------------------------------------------
function renderRoadmap() {
  const stagesBox = document.getElementById('stages');
  stagesBox.replaceChildren();
  for (const stage of roadmap) {
    const li = document.createElement('li');
    li.className = 'stage';
    const h = document.createElement('h3');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = String(stage.stage);
    h.append(num, document.createTextNode(stage.title));
    li.append(h);
    const detail = document.createElement('p');
    detail.textContent = stage.detail;
    li.append(detail);
    const list = document.createElement('ul');
    const stageTrophies = trophies.filter((x) => x.stage === stage.stage);
    // Spoiler-hidden trophies all read the same, so collapse them into one
    // summary line instead of a wall of identical entries.
    const hiddenCount = stageTrophies.filter((t) => isSpoilerHidden(t)).length;
    if (hiddenCount > 0) {
      const item = document.createElement('li');
      item.textContent = `${hiddenCount} hidden story ${hiddenCount === 1 ? 'trophy' : 'trophies'} — names hidden until earned (spoiler setting is on)`;
      list.append(item);
    }
    for (const t of stageTrophies.filter((x) => !isSpoilerHidden(x))) {
      const item = document.createElement('li');
      if (earned.has(t.id)) item.classList.add('done');
      const link = document.createElement('a');
      link.href = `#/guide/${t.id}`;
      link.textContent = t.name;
      item.append(link);
      const mini = document.createElement('span');
      mini.className = 'mini-grade';
      mini.textContent = ` — ${gradeWord(t.grade)}${t.missable ? ' · missable' : ''}`;
      item.append(mini);
      list.append(item);
    }
    li.append(list);
    stagesBox.append(li);
  }
}

// ---- missables view -------------------------------------------------------
function renderMissables() {
  const box = document.getElementById('missableCards');
  box.replaceChildren();
  for (const t of missables) {
    openGuideId = t.id;
    box.append(buildCard(t));
  }
  openGuideId = null;
}

// ---- footer sources -------------------------------------------------------
function renderFooter() {
  const list = document.getElementById('furtherReading');
  list.replaceChildren();
  for (const entry of furtherReading) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = entry.url;
    a.rel = 'noopener';
    a.textContent = entry.name;
    li.append(a);
    list.append(li);
  }
}

// ---- routing --------------------------------------------------------------
function currentView() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash === 'roadmap') return { view: 'roadmap' };
  if (hash === 'missables') return { view: 'missables' };
  const guideMatch = hash.match(/^guide\/(\d+)$/);
  if (guideMatch && byId.has(Number(guideMatch[1]))) {
    return { view: 'list', guideId: Number(guideMatch[1]) };
  }
  const kindMatch = hash.match(/^\?kind=([a-z]+)$/);
  if (kindMatch && (KIND_ORDER.includes(kindMatch[1]) || kindMatch[1] === 'all')) {
    return { view: 'list', kind: kindMatch[1] };
  }
  return { view: 'list' };
}

function route() {
  const { view, guideId, kind } = currentView();
  for (const section of document.querySelectorAll('.view')) section.hidden = true;
  for (const tab of document.querySelectorAll('.tabs a')) tab.classList.remove('active');
  if (kind) {
    activeKind = kind;
    renderKindChips();
  }
  if (view === 'roadmap') {
    document.getElementById('view-roadmap').hidden = false;
    document.getElementById('tab-roadmap').classList.add('active');
    renderRoadmap();
    renderProgress();
  } else if (view === 'missables') {
    document.getElementById('view-missables').hidden = false;
    document.getElementById('tab-missables').classList.add('active');
    renderMissables();
    renderProgress();
  } else {
    document.getElementById('view-list').hidden = false;
    document.getElementById('tab-list').classList.add('active');
    openGuideId = guideId ?? null;
    renderList();
  }
}
window.addEventListener('hashchange', route);

// ---- export / import / reset ----------------------------------------------
document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob(
    [JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)],
    { type: 'application/json' },
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error('not a progress file');
    earned = new Set(ids.filter((id) => byId.has(id)));
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a Leonida Platinum Desk progress export.');
  }
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveProgress();
    renderAll();
  }
});

searchInput.addEventListener('input', renderList);
gradeSelect.addEventListener('change', renderList);
stateSelect.addEventListener('change', renderList);

function renderAll() {
  renderKindChips();
  renderList();
}

renderFooter();
renderAll();
route();
