const topicBank = [
  {
    id: "tech",
    title: "Should schools limit AI tools?",
    prompt:
      "Discuss whether schools should limit AI writing tools or teach students how to use them responsibly.",
    range: "260-320 words",
  },
  {
    id: "culture",
    title: "A tradition worth protecting",
    prompt:
      "Explain one cultural tradition that should be preserved and why it matters to future generations.",
    range: "220-280 words",
  },
  {
    id: "future",
    title: "Cities in 2050",
    prompt:
      "Describe how cities may change by 2050 and evaluate whether those changes will improve daily life.",
    range: "300-360 words",
  },
  {
    id: "environment",
    title: "Should cities ban private cars?",
    prompt:
      "Evaluate whether large cities should restrict private cars in order to reduce pollution and improve public life.",
    range: "280-340 words",
  },
  {
    id: "education",
    title: "Grades or feedback?",
    prompt:
      "Discuss whether schools should rely less on grades and more on detailed teacher feedback.",
    range: "240-300 words",
  },
  {
    id: "work",
    title: "The four-day school week",
    prompt:
      "Argue whether a four-day school week would improve student learning, wellbeing, and responsibility.",
    range: "260-320 words",
  },
  {
    id: "media",
    title: "Do short videos weaken attention?",
    prompt:
      "Analyze whether short-form video platforms are damaging young people's ability to focus deeply.",
    range: "250-310 words",
  },
  {
    id: "health",
    title: "Public health and personal choice",
    prompt:
      "Discuss how governments should balance public health rules with individual freedom.",
    range: "300-360 words",
  },
  {
    id: "books",
    title: "Are printed books still necessary?",
    prompt:
      "Explain whether printed books still have value in a world of digital reading and instant information.",
    range: "220-280 words",
  },
  {
    id: "sports",
    title: "Should every student play a sport?",
    prompt:
      "Evaluate whether schools should require all students to participate in at least one sport or physical activity.",
    range: "240-300 words",
  },
  {
    id: "space",
    title: "Should countries spend money on space?",
    prompt:
      "Discuss whether space exploration is worth major public spending when problems remain on Earth.",
    range: "280-340 words",
  },
];

let topicBatch = 0;
let topics = createTopicBatch();

const spellingFixes = {
  ai: "AI",
  alot: "a lot",
  becuase: "because",
  creat: "create",
  diffrent: "different",
  enviroment: "environment",
  goverment: "government",
  grammer: "grammar",
  ielts: "IELTS",
  improvment: "improvement",
  placemnt: "placement",
  placmnthea: "placement",
  responsiblity: "responsibility",
  seperate: "separate",
  sentec: "sentence",
  sentece: "sentence",
  studnets: "students",
  teh: "the",
  thier: "their",
  writting: "writing",
};

let state = {
  loggedIn: false,
  username: "",
  page: "practice",
  mode: "easy",
  topicId: topics[0].id,
  essay: "",
  reviewed: false,
  history: [],
  accountOpen: false,
  settings: defaultSettings(),
};

const app = document.querySelector("#app");

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function selectedTopic() {
  return topics.find((topic) => topic.id === state.topicId) || topics[0];
}

function createTopicBatch() {
  const start = (topicBatch * 3) % topicBank.length;
  return Array.from({ length: 3 }, (_, index) => {
    const base = topicBank[(start + index) % topicBank.length];
    return { ...base, id: `${base.id}-${topicBatch}` };
  });
}

function refreshTopics() {
  topicBatch += 1;
  topics = createTopicBatch();
  state.topicId = topics[0].id;
}

function initials(name) {
  return (name || "U").trim().slice(0, 1).toUpperCase();
}

function defaultSettings() {
  return { timeFormat: "24", font: "inter", darkMode: false };
}

function userKey() {
  return (state.username || "guest").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "guest";
}

function storageKey(type) {
  return `essaywise-${userKey()}-${type}`;
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(storageKey("history")) || "[]");
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(storageKey("history"), JSON.stringify(state.history));
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey("settings")) || "{}");
    const cleanSettings = {
      timeFormat: saved.timeFormat || "24",
      font: saved.font || "inter",
      darkMode: Boolean(saved.darkMode),
    };
    localStorage.setItem(storageKey("settings"), JSON.stringify(cleanSettings));
    return cleanSettings;
  } catch {
    return defaultSettings();
  }
}

function saveSettings() {
  localStorage.setItem(storageKey("settings"), JSON.stringify(state.settings));
  applySettings();
}

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(storageKey("draft")) || "{}");
  } catch {
    return {};
  }
}

function saveDraft() {
  if (!state.loggedIn) return;
  localStorage.setItem(
    storageKey("draft"),
    JSON.stringify({
      essay: state.essay,
      mode: state.mode,
      topicId: state.topicId,
    }),
  );
}

function loadUserData() {
  const draft = loadDraft();
  state.history = loadHistory();
  state.settings = loadSettings();
  state.essay = draft.essay || "";
  state.mode = draft.mode || "easy";
  state.topicId = topics.some((topic) => topic.id === draft.topicId) ? draft.topicId : topics[0].id;
}

function clearCurrentUserData() {
  localStorage.removeItem(storageKey("history"));
  localStorage.removeItem(storageKey("settings"));
  localStorage.removeItem(storageKey("draft"));
}

function applySettings() {
  document.body.dataset.font = state.settings.font;
  document.body.dataset.theme = state.settings.darkMode ? "dark" : "light";
}

function currentTimeLabel() {
  return new Intl.DateTimeFormat([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: state.settings.timeFormat === "12",
  }).format(new Date());
}

function currentScore() {
  return examinerReport().score;
}

function practiceDays() {
  return [...new Set(state.history.map((entry) => new Date(entry.createdAt).getDate()))];
}

function currentStreak() {
  if (!state.history.length) return 0;
  const days = [...new Set(state.history.map((entry) => new Date(entry.createdAt).toDateString()))]
    .map((day) => new Date(day))
    .sort((a, b) => b - a);
  let streak = 1;
  for (let index = 1; index < days.length; index += 1) {
    const previous = new Date(days[index - 1]);
    previous.setDate(previous.getDate() - 1);
    if (previous.toDateString() !== days[index].toDateString()) break;
    streak += 1;
  }
  return streak;
}

function bestScore() {
  if (!state.history.length) return "-";
  return Math.max(...state.history.map((entry) => Number(entry.score))).toFixed(1);
}

function addHistoryEntry() {
  if (!state.essay.trim()) return;
  const topic = selectedTopic();
  const report = examinerReport();
  const entry = {
    id: Date.now(),
    title: topic.title,
    mode: `${state.mode[0].toUpperCase()}${state.mode.slice(1)} mode`,
    score: report.score,
    note: report.historyNote,
    wordCount: wordCount(state.essay),
    createdAt: new Date().toISOString(),
  };
  state.history = [entry, ...state.history];
  saveHistory();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function spellingIssues(text) {
  return text.match(/\b[A-Za-z]+\b/g)?.filter((word) => spellingFixes[word.toLowerCase()]) || [];
}

function topicKeywords(topic) {
  const baseId = topic.id.split("-")[0];
  const keywordMap = {
    tech: ["ai", "tool", "school", "student", "learn", "responsible"],
    culture: ["tradition", "culture", "preserve", "generation", "future"],
    future: ["city", "cities", "2050", "future", "change", "daily"],
    environment: ["city", "car", "pollution", "public", "transport", "air"],
    education: ["grade", "feedback", "teacher", "school", "student", "learn"],
    work: ["school", "week", "student", "wellbeing", "learn", "responsibility"],
    media: ["video", "attention", "focus", "platform", "young", "deep"],
    health: ["health", "government", "freedom", "choice", "public", "rule"],
    books: ["book", "printed", "digital", "reading", "information"],
    sports: ["sport", "student", "physical", "activity", "school"],
    space: ["space", "exploration", "earth", "public", "spending", "country"],
  };
  return keywordMap[baseId] || topic.title.toLowerCase().split(/\W+/).filter((word) => word.length > 3);
}

function sentenceCount(text) {
  return text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
}

function examinerReport() {
  const topic = selectedTopic();
  const essay = state.essay.trim();
  const count = wordCount(essay);
  const paragraphs = essay ? essay.split(/\n\s*\n/).filter((part) => part.trim()).length : 0;
  const spellingCount = spellingIssues(essay).length;
  const sentences = sentenceCount(essay);
  const lowerEssay = essay.toLowerCase();
  const keywords = topicKeywords(topic);
  const keywordHits = keywords.filter((keyword) => lowerEssay.includes(keyword)).length;
  const hasExample = /\bfor example\b|\bfor instance\b|\bsuch as\b|\bone example\b|\bin my school\b|\bin my city\b/i.test(essay);
  const hasConclusion = /\bin conclusion\b|\boverall\b|\btherefore\b|\bto conclude\b/i.test(essay);
  const hasPosition = /\bi think\b|\bi believe\b|\bin my opinion\b|\bshould\b|\bshould not\b|\bmust\b|\bwould\b/i.test(essay);

  let score = 3.5;
  if (count >= 80) score += 0.8;
  if (count >= 160) score += 0.8;
  if (count >= 240) score += 0.7;
  if (paragraphs >= 2) score += 0.6;
  if (paragraphs >= 3) score += 0.4;
  if (sentences >= 4) score += 0.4;
  if (hasPosition) score += 0.5;
  if (hasExample) score += 0.5;
  if (hasConclusion) score += 0.3;
  if (keywordHits >= 2) score += 0.6;
  if (keywordHits >= 4) score += 0.4;
  score -= Math.min(1.2, spellingCount * 0.3);
  if (count < 40) score = Math.min(score, 4.5);
  if (count < 15) score = Math.min(score, 3.0);

  const roundedScore = Math.max(1, Math.min(9, Math.round(score * 2) / 2)).toFixed(1);
  const weakArea = spellingCount ? "spelling accuracy" : keywordHits < 2 ? "task focus" : paragraphs < 2 ? "paragraph structure" : !hasExample ? "specific evidence" : "conclusion control";
  const nextStep = spellingCount
    ? "Correct the spelling issues first, then reread the paragraph for sentence flow."
    : keywordHits < 2
      ? `Return to the question about "${topic.title}" and use topic-specific words from the prompt.`
      : paragraphs < 2
        ? "Split the essay into an introduction, body paragraph, and conclusion."
        : !hasExample
          ? "Add one concrete example so the examiner can see the argument in real life."
          : "Make the final sentence answer the question more directly.";

  return {
    score: roundedScore,
    count,
    paragraphs,
    spellingCount,
    keywordHits,
    hasExample,
    hasConclusion,
    hasPosition,
    weakArea,
    nextStep,
    historyNote: `Score ${roundedScore}: improve ${weakArea}.`,
    overall:
      count < 40
        ? "This is still a very short draft. The examiner can see the beginning of an idea, but there is not enough development to judge it as a complete essay."
        : keywordHits < 2
          ? `The writing is readable, but it does not stay close enough to the topic "${topic.title}". A stronger answer must use the prompt more directly.`
          : Number(roundedScore) >= 7
            ? "This is a controlled response with a clear position and enough development to interest an examiner."
            : "This draft has a workable idea, but it needs clearer structure, stronger evidence, and more precise language before it feels test-ready.",
  };
}

function renderEditorHighlights(text) {
  if (state.mode !== "easy") return escapeHtml(text);
  return escapeHtml(text).replace(/\b[A-Za-z]+\b/g, (word) => {
    const plainWord = word.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, "");
    return spellingFixes[plainWord.toLowerCase()] ? `<span class="misspell">${word}</span>` : word;
  });
}

function analyzeEssay(text) {
  const issues = [];
  const trimmed = text.trim();

  if (!trimmed) {
    return [
      {
        type: "Coaching",
        title: "Start with a thesis",
        message: "Write one sentence that clearly answers the prompt before adding examples.",
      },
    ];
  }

  const firstLetter = text.match(/[A-Za-z]/);
  if (firstLetter && firstLetter[0] !== firstLetter[0].toUpperCase()) {
    issues.push({
      type: "Grammar",
      title: "Capitalize the opening word",
      message: "Academic essays should begin with a capital letter.",
      action: "capitalize-start",
    });
  }

  const spellingMatch = spellingIssues(text)[0];
  if (spellingMatch) {
    issues.push({
      type: "Spelling",
      title: `Possible spelling issue: "${spellingMatch}"`,
      message: `Suggested correction: "${spellingFixes[spellingMatch.toLowerCase()]}".`,
      action: "replace-word",
      find: spellingMatch,
      replace: spellingFixes[spellingMatch.toLowerCase()],
    });
  }

  if (/\bi\b/.test(text)) {
    issues.push({
      type: "Grammar",
      title: "Capitalize the pronoun I",
      message: "Use uppercase I when referring to yourself.",
      action: "capitalize-i",
    });
  }

  if (/\s{2,}/.test(text)) {
    issues.push({
      type: "Placement",
      title: "Remove extra spacing",
      message: "Extra spaces make the writing look less polished.",
      action: "fix-spacing",
    });
  }

  if (wordCount(text) >= 60 && !/\n\s*\n/.test(text)) {
    issues.push({
      type: "Structure",
      title: "Break into paragraphs",
      message: "Separate the introduction, body idea, and conclusion instead of writing one long block.",
    });
  }

  if (wordCount(text) >= 35 && !/\bfor example\b|\bfor instance\b|\bsuch as\b/i.test(text)) {
    issues.push({
      type: "Director note",
      title: "Add a specific example",
      message: "A concrete example makes the essay more persuasive and memorable.",
    });
  }

  return issues.slice(0, 5);
}

function applyIssue(issue) {
  if (!issue?.action) return;
  if (issue.action === "capitalize-start") {
    state.essay = state.essay.replace(/[A-Za-z]/, (letter) => letter.toUpperCase());
  }
  if (issue.action === "replace-word") {
    state.essay = state.essay.replace(new RegExp(`\\b${issue.find}\\b`, "i"), issue.replace);
  }
  if (issue.action === "capitalize-i") {
    state.essay = state.essay.replace(/\bi\b/g, "I");
  }
  if (issue.action === "fix-spacing") {
    state.essay = state.essay.replace(/[ \t]{2,}/g, " ");
  }
}

function updateEditorHighlights() {
  const highlights = document.querySelector(".editor-highlights");
  const essayText = document.querySelector("#essayText");
  if (!highlights || !essayText) return;
  highlights.innerHTML = renderEditorHighlights(state.essay);
  highlights.scrollTop = essayText.scrollTop;
  highlights.scrollLeft = essayText.scrollLeft;
}

function render() {
  applySettings();
  app.innerHTML = state.loggedIn ? renderApp() : renderLogin();
  bindEvents();
}

function renderAtTop() {
  render();
  window.scrollTo({ top: 0, left: 0 });
}

function renderLogin() {
  return `
    <section class="login-shell">
      <div class="login-panel">
        <div>
          <div class="brand"><span class="mark">E</span><span>EssayWise Academy</span></div>
          <div class="login-copy">
            <h1>Practice essays with a director's eye.</h1>
            <p>Choose an AI-generated topic, write under easy or hard mode, then receive a rigorous review from a mentor trained like an IELTS examiner and elite writing professor.</p>
          </div>
          <div class="mentor-card">
            <strong>AI personality</strong>
            Oxford writing tutor, Harvard essay coach, and IELTS director in one calm, demanding reviewer.
          </div>
        </div>
      </div>
      <div class="login-form-wrap">
        <form class="login-form" id="loginForm">
          <h2>Student login</h2>
          <p>Use a username and password to enter your own writing space.</p>
          <div class="field">
            <label for="username">Username</label>
            <input id="username" value="${state.username}" autocomplete="username" placeholder="Enter username" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" autocomplete="current-password" placeholder="Enter password" />
          </div>
          <button class="primary-btn" type="submit">Enter writing room</button>
        </form>
      </div>
    </section>
  `;
}

function renderApp() {
  return `
    <section class="app-shell">
      <aside class="sidebar">
        <div class="brand"><span class="mark">E</span><span>EssayWise</span></div>
        <nav class="nav" aria-label="Main navigation">
          ${navButton("home", "Home", "⌂")}
          ${navButton("practice", "Practice", "✎")}
          ${navButton("history", "History", "↶")}
        </nav>
        <div class="sidebar-note">Easy mode guides grammar while you write. Hard mode keeps the room quiet until the final review.</div>
      </aside>
      <section class="content">
        <header class="topbar">
          <div class="welcome">
            <span>Welcome back, ${state.username}</span>
            <h1>${pageTitle()}</h1>
          </div>
          <div class="top-actions">
            <div class="time-pill" id="timeDisplay">${currentTimeLabel()}</div>
            <div class="word-pill">${wordCount(state.essay)} words</div>
            <button class="icon-btn" id="darkModeToggle" type="button" title="Turn dark mode ${state.settings.darkMode ? "off" : "on"}" aria-label="Turn dark mode ${state.settings.darkMode ? "off" : "on"}">${state.settings.darkMode ? "L" : "D"}</button>
            <div class="profile-menu-wrap">
              <button class="avatar profile-trigger" id="profileButton" type="button" aria-expanded="${state.accountOpen}" aria-label="Profile settings">${initials(state.username)}</button>
              ${state.accountOpen ? renderProfileMenu() : ""}
            </div>
          </div>
        </header>
        <div class="page">
          ${state.page === "home" ? renderHome() : ""}
          ${state.page === "practice" ? renderPractice() : ""}
          ${state.page === "history" ? renderHistory() : ""}
          ${state.page === "review" ? renderReview() : ""}
        </div>
      </section>
    </section>
  `;
}

function renderProfileMenu() {
  return `
    <div class="profile-menu">
      <div class="profile-summary">
        <div class="avatar">${initials(state.username)}</div>
        <div><strong>${state.username}</strong><span>Account settings</span></div>
      </div>
      <label class="setting-row" for="timeFormat">
        <span>Time format</span>
        <select id="timeFormat">
          <option value="24" ${state.settings.timeFormat === "24" ? "selected" : ""}>24-hour</option>
          <option value="12" ${state.settings.timeFormat === "12" ? "selected" : ""}>12-hour</option>
        </select>
      </label>
      <label class="setting-row" for="fontChoice">
        <span>Font</span>
        <select id="fontChoice">
          <option value="inter" ${state.settings.font === "inter" ? "selected" : ""}>Inter</option>
          <option value="serif" ${state.settings.font === "serif" ? "selected" : ""}>Serif</option>
          <option value="large" ${state.settings.font === "large" ? "selected" : ""}>Large readable</option>
        </select>
      </label>
      <button class="menu-action" id="signOut" type="button">Sign out</button>
      <button class="menu-action danger" id="deleteAccount" type="button">Delete account</button>
    </div>
  `;
}

function navButton(page, label, icon) {
  return `<button class="nav-item ${state.page === page ? "active" : ""}" data-page="${page}" type="button"><span class="nav-icon">${icon}</span>${label}</button>`;
}

function pageTitle() {
  if (state.page === "home") return "Explore student essays";
  if (state.page === "history") return "Your writing history";
  if (state.page === "review") return "Director's review";
  return "Practice room";
}

function renderPractice() {
  const topic = selectedTopic();
  return `
    <div class="practice-grid">
      <section class="panel practice-main">
        <div class="section-head">
          <div>
            <h2>Choose a topic</h2>
            <p>The AI sets a focused prompt and analyzes the recommended word range before you write.</p>
          </div>
          <button class="secondary-btn" id="newTopics" type="button">Refresh topics</button>
        </div>
        <div class="topics">
          ${topics
            .map(
              (item) => `
                <button class="topic-card ${item.id === state.topicId ? "active" : ""}" data-topic="${item.id}" type="button">
                  <strong>${item.title}</strong>
                  <span>${item.range}</span>
                </button>
              `,
            )
            .join("")}
        </div>
        <div class="editor-toolbar">
          <div>
            <div class="label">Selected prompt</div>
            <strong>${topic.prompt}</strong>
          </div>
          <div class="mode-switch" aria-label="Writing mode">
            <button class="mode-btn ${state.mode === "easy" ? "active" : ""}" data-mode="easy" type="button">Easy mode</button>
            <button class="mode-btn ${state.mode === "hard" ? "active" : ""}" data-mode="hard" type="button">Hard mode</button>
          </div>
          <div class="toolbar-meta"><span>${topic.range}</span><span>${readinessLabel()}</span></div>
        </div>
        <div class="writing-layout">
          <div class="editor-wrap">
            <div class="editor-highlights" aria-hidden="true">${renderEditorHighlights(state.essay)}</div>
            <textarea id="essayText" aria-label="Essay editor" spellcheck="${state.mode === "easy"}" placeholder="Start writing your essay here...">${state.essay}</textarea>
          </div>
          <aside class="helper">
            ${state.mode === "easy" ? renderEasyHints() : renderHardMode()}
          </aside>
        </div>
        <div class="submit-row">
          <button class="primary-btn" id="submitEssay" type="button">Submit for AI review</button>
        </div>
      </section>
      ${renderRightRail()}
    </div>
  `;
}

function renderEasyHints() {
  const issues = analyzeEssay(state.essay);
  return `
    <div class="helper-head">
      <h3>Live correction mentor</h3>
      <span>${issues.length} alerts</span>
    </div>
    ${
      issues.length
        ? issues
            .map(
              (issue, index) => `
                <div class="issue-card">
                  <div>
                    <strong>${issue.type}</strong>
                    <h4>${issue.title}</h4>
                    <p>${issue.message}</p>
                  </div>
                  ${issue.action ? `<button class="fix-btn" data-fix="${index}" type="button">Apply fix</button>` : ""}
                </div>
              `,
            )
            .join("")
        : `<div class="issue-card clear"><strong>Clean draft</strong><p>No obvious grammar or spelling issue detected. Keep developing your argument.</p></div>`
    }
  `;
}

function renderHardMode() {
  return `
    <h3>Hard mode is active</h3>
    <div class="hint"><strong>No live help</strong><span>Write as if this is a real test. The AI examiner will only respond after you submit.</span></div>
  `;
}

function readinessLabel() {
  const count = wordCount(state.essay);
  if (count < 80) return "Draft beginning";
  if (count < 220) return "Developing";
  return "Ready to review";
}

function renderRightRail() {
  const days = practiceDays();
  return `
    <aside class="panel right-rail">
      <div class="rail-block">
        <div class="profile-card">
          <div class="avatar">${initials(state.username)}</div>
          <div><strong>${state.username}</strong><span>Essay apprentice</span></div>
        </div>
      </div>
      <div class="rail-block">
        <h2 class="rail-title">May practice</h2>
        <div class="calendar">${Array.from({ length: 31 }, (_, index) => `<div class="day ${days.includes(index + 1) ? "practice" : ""}">${index + 1}</div>`).join("")}</div>
      </div>
      <div class="rail-block metric-list">
        <div class="metric"><span>Essays written</span><strong>${state.history.length}</strong></div>
        <div class="metric"><span>Best score</span><strong>${bestScore()}</strong></div>
        <div class="metric"><span>Current streak</span><strong>${currentStreak()} days</strong></div>
        <div class="metric"><span>Favorite mode</span><strong>${state.mode === "easy" ? "Easy" : "Hard"}</strong></div>
      </div>
    </aside>
  `;
}

function renderHome() {
  return `
    <div class="home-grid">
      <section class="panel home-list">
        <div class="section-head">
          <div>
            <h2>Other students' essays</h2>
            <p>Shared essays will appear here after real users choose to publish their work.</p>
          </div>
        </div>
        <div class="empty-state">
          <h3>No public essays yet</h3>
          <p>This area is reserved for real shared writing. The app will not show fake classmates or sample history.</p>
          <button class="secondary-btn" data-page="practice" type="button">Write an essay</button>
        </div>
      </section>
      ${renderRightRail()}
    </div>
  `;
}

function renderHistory() {
  const historyMarkup = state.history.length
    ? state.history
        .map(
          (entry) => `
            <article class="history-card">
              <h3>${entry.title}</h3>
              <div class="tag-row"><span class="tag">${entry.mode}</span><span class="tag">Score ${entry.score}</span><span class="tag">${entry.wordCount} words</span></div>
              <p>${entry.note}</p>
            </article>
          `,
        )
        .join("")
    : `
      <div class="empty-state">
        <h3>No essay history yet</h3>
        <p>Submit your first essay from the Practice page and your real result will appear here.</p>
        <button class="secondary-btn" data-page="practice" type="button">Start practicing</button>
      </div>
    `;

  return `
    <div class="history-grid">
      <section class="panel history-list">
        <div class="section-head">
          <div>
            <h2>Essay writing history</h2>
            <p>Your previous attempts, modes, scores, and improvement notes.</p>
          </div>
        </div>
        ${historyMarkup}
      </section>
      ${renderRightRail()}
    </div>
  `;
}

function renderReview() {
  const report = examinerReport();
  return `
    <div class="review-grid">
      <section class="panel review-panel">
        <h2>AI examiner report</h2>
        <p>Your essay was reviewed for grammar, spelling, structure, story strength, examiner appeal, and overall test performance.</p>
        <div class="score">
          <div class="score-ring">${report.score}</div>
          <div class="score-detail">
            <strong>Overall result</strong><br />
            ${report.overall}
          </div>
        </div>
        <div class="review-list">
          ${reviewItems(report)
            .map((item) => `<div class="review-item"><strong>${item[0]}</strong><span>${item[1]}</span></div>`)
            .join("")}
        </div>
      </section>
      <section class="panel review-panel">
        <h2>What to improve next</h2>
        <p>${report.nextStep}</p>
        <div class="tag-row"><span class="tag">${selectedTopic().range}</span><span class="tag">${state.mode} mode</span><span class="tag">${report.count} words</span><span class="tag">${report.paragraphs} paragraphs</span></div>
        <button class="primary-btn" id="backToPractice" type="button" style="margin-top:18px">Return to practice</button>
      </section>
      <section class="panel review-panel revision-panel">
        <div class="section-head">
          <div>
            <h2>Complete revised version</h2>
            <p>A polished model answer that shows how the essay could sound after revision.</p>
          </div>
        </div>
        <article class="revision-card">
          ${revisedEssay(report)
            .split("\n\n")
            .map((paragraph) => `<p>${paragraph}</p>`)
            .join("")}
        </article>
      </section>
    </div>
  `;
}

function revisedEssay(report) {
  const topic = selectedTopic();
  const focusLine = report.keywordHits < 2
    ? `The revision must stay close to the topic by directly answering: ${topic.prompt}`
    : "The revision can keep the original direction, but it should make the reasoning clearer and more academic.";
  const exampleLine = report.hasExample
    ? "The example should be connected more clearly to the main argument so it does not feel decorative."
    : "A concrete example should be added because examiners reward writing that moves beyond general opinion.";

  return `In response to the topic "${topic.title}", I would take a clear position from the first paragraph. ${focusLine} A strong opening should name the issue, give a direct opinion, and prepare the reader for the main reasons that follow.

The body of the essay should develop one main idea at a time. ${exampleLine} Each paragraph should begin with a claim, explain why that claim matters, and then show a realistic result for students, families, cities, or society. This makes the writing sound controlled rather than memorized.

Overall, the revised version should end by returning to the question directly. The final sentence should not introduce a new idea; it should confirm the writer's answer and leave the examiner with a clear sense of purpose, accuracy, and mature judgment.`;
}

function reviewItems(report) {
  return [
    [
      "Grammar and spelling",
      report.spellingCount
        ? `I found ${report.spellingCount} likely spelling issue${report.spellingCount === 1 ? "" : "s"}. Correct these first because they lower the examiner's trust in the writing.`
        : "No major known spelling issue was detected. The next grammar focus is sentence control and punctuation after full ideas.",
    ],
    [
      "Task response",
      report.keywordHits < 2
        ? `The essay does not connect strongly enough to "${selectedTopic().title}". Use more language from the prompt and answer the exact question.`
        : `The essay connects to the selected topic with ${report.keywordHits} clear topic signal${report.keywordHits === 1 ? "" : "s"}. Now develop the argument with more depth.`,
    ],
    [
      "Essay structure",
      report.paragraphs < 2
        ? "The draft reads like one block. A real test essay needs visible paragraphing: introduction, body, and conclusion."
        : `The essay has ${report.paragraphs} paragraph${report.paragraphs === 1 ? "" : "s"}. Make sure each body paragraph begins with a direct claim.`,
    ],
    [
      "Story and persuasion",
      report.hasExample
        ? "There is some attempt to support the idea. Make the example more specific and clearly linked to the thesis."
        : "The argument is too general without an example. Add one realistic example to make the examiner remember the point.",
    ],
    [
      "Director appeal",
      report.hasConclusion
        ? "The ending signals closure. Strengthen it by echoing the key reason from the essay."
        : "The essay needs a stronger final sentence that directly answers the prompt and sounds confident.",
    ],
  ];
}

function bindEvents() {
  const loginForm = document.querySelector("#loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.querySelector("#username").value.trim();
      state.username = name || "Student";
      loadUserData();
      state.loggedIn = true;
      state.accountOpen = false;
      state.reviewed = false;
      renderAtTop();
    });
  }

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.page = button.dataset.page;
      state.accountOpen = false;
      renderAtTop();
    });
  });

  const profileButton = document.querySelector("#profileButton");
  if (profileButton) {
    profileButton.addEventListener("click", () => {
      state.accountOpen = !state.accountOpen;
      render();
    });
  }

  const darkModeToggle = document.querySelector("#darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      state.settings.darkMode = !state.settings.darkMode;
      saveSettings();
      render();
    });
  }

  const timeFormat = document.querySelector("#timeFormat");
  if (timeFormat) {
    timeFormat.addEventListener("change", (event) => {
      state.settings.timeFormat = event.target.value;
      saveSettings();
      render();
    });
  }

  const fontChoice = document.querySelector("#fontChoice");
  if (fontChoice) {
    fontChoice.addEventListener("change", (event) => {
      state.settings.font = event.target.value;
      saveSettings();
      render();
    });
  }

  const signOut = document.querySelector("#signOut");
  if (signOut) {
    signOut.addEventListener("click", () => {
      saveDraft();
      state.loggedIn = false;
      state.accountOpen = false;
      state.page = "practice";
      state.username = "";
      state.essay = "";
      state.history = [];
      state.settings = defaultSettings();
      applySettings();
      renderAtTop();
    });
  }

  const deleteAccount = document.querySelector("#deleteAccount");
  if (deleteAccount) {
    deleteAccount.addEventListener("click", () => {
      const confirmed = window.confirm("Delete this local account, essay history, and settings?");
      if (!confirmed) return;
      clearCurrentUserData();
      localStorage.removeItem("essaywise-history");
      localStorage.removeItem("essaywise-settings");
      state.loggedIn = false;
      state.accountOpen = false;
      state.username = "";
      state.essay = "";
      state.history = [];
      state.settings = defaultSettings();
      applySettings();
      renderAtTop();
    });
  }

  document.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      state.topicId = button.dataset.topic;
      saveDraft();
      render();
    });
  });

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      saveDraft();
      render();
    });
  });

  const essayText = document.querySelector("#essayText");
  if (essayText) {
    essayText.addEventListener("input", (event) => {
      state.essay = event.target.value;
      saveDraft();
      document.querySelector(".word-pill").textContent = `${wordCount(state.essay)} words`;
      updateEditorHighlights();
      const helper = document.querySelector(".helper");
      if (helper && state.mode === "easy") {
        helper.innerHTML = renderEasyHints();
        bindFixButtons();
      }
    });
    essayText.addEventListener("scroll", () => updateEditorHighlights());
  }

  bindFixButtons();

  const submit = document.querySelector("#submitEssay");
  if (submit) {
    submit.addEventListener("click", () => {
      addHistoryEntry();
      saveDraft();
      state.page = "review";
      state.reviewed = true;
      renderAtTop();
    });
  }

  const back = document.querySelector("#backToPractice");
  if (back) {
    back.addEventListener("click", () => {
      state.page = "practice";
      renderAtTop();
    });
  }

  const refresh = document.querySelector("#newTopics");
  if (refresh) {
    refresh.addEventListener("click", () => {
      refreshTopics();
      saveDraft();
      render();
    });
  }
}

function bindFixButtons() {
  document.querySelectorAll("[data-fix]").forEach((button) => {
    button.addEventListener("click", () => {
      const issues = analyzeEssay(state.essay);
      applyIssue(issues[Number(button.dataset.fix)]);
      saveDraft();
      const essayText = document.querySelector("#essayText");
      if (essayText) essayText.value = state.essay;
      updateEditorHighlights();
      const wordPill = document.querySelector(".word-pill");
      if (wordPill) wordPill.textContent = `${wordCount(state.essay)} words`;
      const helper = document.querySelector(".helper");
      if (helper && state.mode === "easy") {
        helper.innerHTML = renderEasyHints();
        bindFixButtons();
      }
    });
  });
}

render();

setInterval(() => {
  const timeDisplay = document.querySelector("#timeDisplay");
  if (timeDisplay) timeDisplay.textContent = currentTimeLabel();
}, 15000);
