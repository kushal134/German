const TOPICS = [
  { id: "nominativ", label: "Nominativ + Gender Articles" },
  { id: "akkusativ", label: "Akkusativ (Direct Object)" },
  { id: "dativ", label: "Dativ Basics" },
  { id: "modalverben", label: "Modal Verbs (koennen, muessen...)" },
  { id: "trennbare", label: "Separable Verbs" },
  { id: "wortstellung", label: "Word Order (Position 2)" },
];

const LEXICON = {
  nouns: {
    der: ["Mann", "Tisch", "Kugelschreiber", "Lehrer", "Student", "Bruder", "Hund", "Apfel"],
    die: ["Lampe", "Tasche", "Frau", "Banane", "Zeitung", "Stadt", "Schule", "Musik"],
    das: ["Kind", "Buch", "Auto", "Handy", "Bild", "Wasser", "Brot", "Fenster"],
  },
  pronouns: [
    { key: "ich", meaning: "I" },
    { key: "du", meaning: "you (informal)" },
    { key: "er", meaning: "he" },
    { key: "sie", meaning: "she" },
    { key: "es", meaning: "it" },
    { key: "wir", meaning: "we" },
    { key: "ihr", meaning: "you all" },
    { key: "Sie", meaning: "you (formal)" },
  ],
  subjects: ["Ich", "Du", "Er", "Sie", "Wir", "Ihr"],
  modalInfinitives: ["lernen", "arbeiten", "kommen", "gehen", "schwimmen", "essen", "lesen"],
  modals: [
    { infinitive: "koennen", ich: "kann", du: "kannst", er: "kann", wir: "koennen", ihr: "koennt" },
    { infinitive: "muessen", ich: "muss", du: "musst", er: "muss", wir: "muessen", ihr: "muesst" },
    { infinitive: "wollen", ich: "will", du: "willst", er: "will", wir: "wollen", ihr: "wollt" },
    { infinitive: "duerfen", ich: "darf", du: "darfst", er: "darf", wir: "duerfen", ihr: "duerft" },
  ],
  separable: [
    { infinitive: "aufstehen", stem: "stehe", prefix: "auf", phrase: "um 7 Uhr" },
    { infinitive: "einkaufen", stem: "kaufe", prefix: "ein", phrase: "am Samstag" },
    { infinitive: "anrufen", stem: "rufe", prefix: "an", phrase: "meine Mutter" },
    { infinitive: "fernsehen", stem: "sehe", prefix: "fern", phrase: "am Abend" },
  ],
  firstParts: ["Heute", "Am Montag", "Um 8 Uhr", "Morgen"],
  verbs: ["lerne", "arbeite", "spiele", "koche"],
};

const app = {
  role: null,
  session: null,
  sessionId: null,
  playerId: null,
  playerScore: 0,
  pollId: null,
  uiTimer: null,
  shownQuestionIndex: null,
  lastQuestionStartedAt: null,
  playerAnsweredIndex: null,
  insights: null,
};

const el = {
  roleScreen: document.getElementById("role-screen"),
  openHostBtn: document.getElementById("open-host-btn"),
  openJoinBtn: document.getElementById("open-join-btn"),
  hostSetupScreen: document.getElementById("host-setup-screen"),
  topicList: document.getElementById("topic-list"),
  questionCount: document.getElementById("question-count"),
  timeLimit: document.getElementById("time-limit"),
  difficulty: document.getElementById("difficulty"),
  apiKey: document.getElementById("api-key"),
  apiBase: document.getElementById("api-base"),
  apiModel: document.getElementById("api-model"),
  createSessionBtn: document.getElementById("create-session-btn"),
  hostBackBtn: document.getElementById("host-back-btn"),
  hostSetupError: document.getElementById("host-setup-error"),
  hostLobbyScreen: document.getElementById("host-lobby-screen"),
  joinCodeDisplay: document.getElementById("join-code-display"),
  sessionCodeText: document.getElementById("session-code-text"),
  sessionShareLink: document.getElementById("session-share-link"),
  copyJoinLinkBtn: document.getElementById("copy-join-link-btn"),
  startLiveQuizBtn: document.getElementById("start-live-quiz-btn"),
  hostPlayerList: document.getElementById("host-player-list"),
  hostLiveScreen: document.getElementById("host-live-screen"),
  hostProgress: document.getElementById("host-progress"),
  hostTimer: document.getElementById("host-timer"),
  hostQuestionVisual: document.getElementById("host-question-visual"),
  hostQuestionText: document.getElementById("host-question-text"),
  hostAnswerGrid: document.getElementById("host-answer-grid"),
  hostNextBtn: document.getElementById("host-next-btn"),
  hostEndBtn: document.getElementById("host-end-btn"),
  joinScreen: document.getElementById("join-screen"),
  joinCode: document.getElementById("join-code"),
  joinNickname: document.getElementById("join-nickname"),
  joinSessionBtn: document.getElementById("join-session-btn"),
  joinBackBtn: document.getElementById("join-back-btn"),
  joinError: document.getElementById("join-error"),
  playerWaitingScreen: document.getElementById("player-waiting-screen"),
  waitingMessage: document.getElementById("waiting-message"),
  playerQuestionScreen: document.getElementById("player-question-screen"),
  playerProgress: document.getElementById("player-progress"),
  playerScore: document.getElementById("player-score"),
  playerTimer: document.getElementById("player-timer"),
  playerQuestionVisual: document.getElementById("player-question-visual"),
  playerQuestionText: document.getElementById("player-question-text"),
  playerAnswerGrid: document.getElementById("player-answer-grid"),
  resultsScreen: document.getElementById("results-screen"),
  resultsTitle: document.getElementById("results-title"),
  resultsLeaderboard: document.getElementById("results-leaderboard"),
  hostQuestionPreview: document.getElementById("host-question-preview"),
  hostInsightsPanel: document.getElementById("host-insights-panel"),
  hostInsightsSummary: document.getElementById("host-insights-summary"),
  downloadInsightsBtn: document.getElementById("download-insights-btn"),
  restartBtn: document.getElementById("restart-btn"),
};

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function ensureFourOptions(correct, pool) {
  const s = new Set([correct]);
  for (const item of shuffle(pool)) {
    if (s.size >= 4) break;
    s.add(item);
  }
  return shuffle([...s]);
}
function hideAllScreens() {
  [
    el.roleScreen,
    el.hostSetupScreen,
    el.hostLobbyScreen,
    el.hostLiveScreen,
    el.joinScreen,
    el.playerWaitingScreen,
    el.playerQuestionScreen,
    el.resultsScreen,
  ].forEach((s) => s.classList.add("hidden"));
}
function showScreen(target) {
  hideAllScreens();
  target.classList.remove("hidden");
}
async function sb(path, method = "GET", body = null) {
  const endpoint = `/api/db?path=${encodeURIComponent(path)}`;
  const res = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Server request failed (${res.status}).`);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : [];
}

function renderTopicCheckboxes() {
  el.topicList.innerHTML = "";
  TOPICS.forEach((topic) => {
    const item = document.createElement("label");
    item.className = "topic-item";
    item.innerHTML = `<input type="checkbox" value="${topic.id}" /><span>${topic.label}</span>`;
    el.topicList.appendChild(item);
  });
}

function addQ(pool, dedupe, q) {
  const key = `${q.topic}:${q.question}:${q.answer}`;
  if (!dedupe.has(key)) {
    dedupe.add(key);
    pool.push(q);
  }
}
function generateLocalPool(topicIds, difficulty) {
  const pool = [];
  const dedupe = new Set();
  if (topicIds.includes("nominativ")) {
    [...LEXICON.nouns.der.map((n) => ["der", n]), ...LEXICON.nouns.die.map((n) => ["die", n]), ...LEXICON.nouns.das.map((n) => ["das", n])].forEach(([article, noun]) => {
      addQ(pool, dedupe, { topic: "Nominativ + Gender Articles", level: "easy", question: `Choose article: ___ ${noun}`, choices: ensureFourOptions(article, ["der", "die", "das", "den", "dem"]), answer: article, explanation: `"${noun}" uses "${article}".` });
    });
  }
  if (topicIds.includes("akkusativ")) {
    LEXICON.nouns.der.forEach((noun) => addQ(pool, dedupe, { topic: "Akkusativ (Direct Object)", level: "easy", question: `Ich sehe ___ ${noun}.`, choices: ensureFourOptions("den", ["den", "der", "dem", "das"]), answer: "den", explanation: "Masculine accusative uses den." }));
  }
  if (topicIds.includes("dativ")) {
    LEXICON.nouns.der.forEach((noun) => addQ(pool, dedupe, { topic: "Dativ Basics", level: "hard", question: `Ich helfe ___ ${noun}.`, choices: ensureFourOptions("dem", ["dem", "den", "des", "der"]), answer: "dem", explanation: "Helfen takes dative." }));
  }
  if (topicIds.includes("modalverben")) {
    LEXICON.subjects.forEach((subject) => {
      const key = subject === "Ich" ? "ich" : subject === "Du" ? "du" : subject === "Er" ? "er" : subject === "Ihr" ? "ihr" : "wir";
      LEXICON.modals.forEach((modal) => {
        const inf = sample(LEXICON.modalInfinitives);
        const answer = `${subject} ${modal[key]} ${inf}.`;
        addQ(pool, dedupe, { topic: "Modal Verbs (koennen, muessen...)", level: key === "wir" ? "easy" : "hard", question: "Pick the correct sentence.", choices: ensureFourOptions(answer, [`${subject} ${modal.infinitive} ${inf}.`, `${subject} ${modal.wir} ${inf}.`, `${subject} ${modal.er} ${inf}.`]), answer, explanation: "Conjugate modal by subject." });
      });
    });
  }
  if (topicIds.includes("trennbare")) {
    LEXICON.separable.forEach((v) => {
      const answer = `Ich ${v.stem} ${v.phrase} ${v.prefix}.`;
      addQ(pool, dedupe, { topic: "Separable Verbs", level: "hard", question: `Choose correct order for "${v.infinitive}".`, choices: shuffle([answer, `Ich ${v.infinitive} ${v.phrase}.`, `${v.phrase} ich ${v.stem} ${v.prefix}.`, `Ich ${v.stem} ${v.prefix} ${v.phrase}.`]), answer, explanation: "Prefix moves to end." });
    });
  }
  if (topicIds.includes("wortstellung")) {
    LEXICON.firstParts.forEach((first) => {
      LEXICON.verbs.forEach((verb) => {
        const answer = `${first} ${verb} ich Deutsch.`;
        addQ(pool, dedupe, { topic: "Word Order (Position 2)", level: "mixed", question: "Which sentence has correct word order?", choices: shuffle([answer, `${first} ich ${verb} Deutsch.`, `Ich ${first.toLowerCase()} ${verb} Deutsch.`, `${verb} ich ${first.toLowerCase()} Deutsch.`]), answer, explanation: "Verb should be 2nd position." });
      });
    });
  }
  return difficulty === "mixed" ? pool : pool.filter((q) => q.level === difficulty || q.level === "mixed");
}

async function generateWithAI(topicIds, count, difficulty) {
  const apiKey = el.apiKey.value.trim();
  if (!apiKey) return [];
  const model = el.apiModel.value.trim() || "gpt-4o-mini";
  const base = (el.apiBase.value.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
  const topicLabels = TOPICS.filter((t) => topicIds.includes(t.id)).map((t) => t.label).join(", ");
  const prompt = `Generate ${count} A1 German MCQ questions only for: ${topicLabels}. Difficulty ${difficulty}. Return strict JSON array with topic,level,question,choices,answer,explanation.`;
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: "Output JSON only." }, { role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content || "[]";
    const extracted = content.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(extracted ? extracted[0] : content);
    return Array.isArray(parsed) ? parsed.filter((q) => q?.question && q?.answer && Array.isArray(q?.choices)) : [];
  } catch {
    return [];
  }
}

async function createHostSession() {
  const checked = [...el.topicList.querySelectorAll("input:checked")].map((n) => n.value);
  if (!checked.length) {
    el.hostSetupError.textContent = "Select at least one topic.";
    return;
  }
  try {
    el.createSessionBtn.disabled = true;
    el.createSessionBtn.textContent = "Creating...";
    const questionCount = Number(el.questionCount.value);
    const timeLimit = Number(el.timeLimit.value);
    const difficulty = el.difficulty.value;
    const code = randomCode();
    const hostToken = crypto.randomUUID();
    let questions = generateLocalPool(checked, difficulty);
    const aiQ = await generateWithAI(checked, questionCount, difficulty);
    questions = shuffle([...questions, ...aiQ]);
    questions = questions.slice(0, questionCount).map((q, i) => ({ ...q, order_index: i + 1 }));
    if (!questions.length) throw new Error("No generated questions.");

    const [session] = await sb("live_sessions", "POST", [{
      join_code: code,
      host_token: hostToken,
      status: "lobby",
      current_question_index: 0,
      time_limit_sec: timeLimit,
      question_count: questionCount,
    }]);
    const rows = questions.map((q) => ({
      session_id: session.id,
      order_index: q.order_index,
      topic: q.topic,
      level: q.level || "mixed",
      question: q.question,
      choices: q.choices,
      answer: q.answer,
      explanation: q.explanation || "",
    }));
    await sb("live_questions", "POST", rows);

    app.role = "host";
    app.session = session;
    app.sessionId = session.id;
    localStorage.setItem("hostToken", hostToken);
    openHostLobby();
  } catch (err) {
    el.hostSetupError.textContent = err.message;
  } finally {
    el.createSessionBtn.disabled = false;
    el.createSessionBtn.textContent = "Create Live Session";
  }
}

function openHostLobby() {
  stopUiTimer();
  app.shownQuestionIndex = null;
  app.lastQuestionStartedAt = null;
  showScreen(el.hostLobbyScreen);
  const link = buildJoinLink(app.session.join_code);
  if (el.joinCodeDisplay) el.joinCodeDisplay.textContent = app.session.join_code;
  el.sessionCodeText.textContent = "Students enter this code on their phones.";
  el.sessionShareLink.textContent = `Share this join link with students: ${link}`;
  startPolling();
}

async function copyJoinLink() {
  const link = buildJoinLink(app.session.join_code);
  await navigator.clipboard.writeText(link);
}
function buildJoinLink(joinCode) {
  const url = new URL(window.location.href);
  url.searchParams.set("join", joinCode);
  return url.toString();
}

async function startLiveQuiz() {
  await updateSession({ status: "active", current_question_index: 1, question_started_at: new Date().toISOString() });
}

async function hostNextQuestion() {
  const idx = app.session.current_question_index + 1;
  if (idx > app.session.question_count) {
    await updateSession({ status: "finished", current_question_index: app.session.question_count });
    return;
  }
  await updateSession({ current_question_index: idx, question_started_at: new Date().toISOString() });
}

async function hostEndQuiz() {
  await updateSession({ status: "finished" });
}

async function updateSession(patch) {
  const rows = await sb(`live_sessions?id=eq.${app.sessionId}`, "PATCH", patch);
  if (rows[0]) app.session = rows[0];
}

async function joinSession() {
  try {
    const code = el.joinCode.value.trim().toUpperCase();
    const nickname = el.joinNickname.value.trim();
    if (!code || !nickname) throw new Error("Enter join code and nickname.");
    const sessions = await sb(`live_sessions?join_code=eq.${code}&select=*`);
    if (!sessions.length) throw new Error("Session not found.");
    const session = sessions[0];
    const [player] = await sb("live_players", "POST", [{
      session_id: session.id,
      nickname: nickname.slice(0, 30),
      total_score: 0,
    }]);
    app.role = "player";
    app.session = session;
    app.sessionId = session.id;
    app.playerId = player.id;
    app.playerScore = 0;
    app.shownQuestionIndex = null;
    showScreen(el.playerWaitingScreen);
    startPolling();
  } catch (err) {
    el.joinError.textContent = `${err.message} Please verify code or try again in a few seconds.`;
  }
}

function startPolling() {
  clearInterval(app.pollId);
  tick();
  app.pollId = setInterval(tick, 2000);
}

async function tick() {
  if (!app.sessionId) return;
  const sessions = await sb(`live_sessions?id=eq.${app.sessionId}&select=*`);
  if (!sessions.length) return;
  app.session = sessions[0];
  if (app.role === "host") {
    if (app.session.status === "lobby") {
      stopUiTimer();
      return renderHostLobby();
    }
    if (app.session.status === "active") return renderHostLive();
    return renderResults();
  }
  if (app.role === "player") {
    if (app.session.status === "lobby") {
      stopUiTimer();
      return showScreen(el.playerWaitingScreen);
    }
    if (app.session.status === "active") return renderPlayerQuestion();
    return renderResults();
  }
}

async function renderHostLobby() {
  showScreen(el.hostLobbyScreen);
  const players = await sb(`live_players?session_id=eq.${app.sessionId}&order=created_at.asc&select=*`);
  const questions = await sb(`live_questions?session_id=eq.${app.sessionId}&order=order_index.asc&select=*`);
  el.hostPlayerList.innerHTML = players.length
    ? players.map((p) => `<article class="review-item"><p>${p.nickname}</p></article>`).join("")
    : '<article class="review-item"><p>No players yet.</p></article>';
  el.hostQuestionPreview.innerHTML = questions.length
    ? questions
        .map(
          (q) =>
            `<article class="review-item"><p><strong>Q${q.order_index}</strong> (${q.topic})</p><p>${q.question}</p></article>`
        )
        .join("")
    : '<article class="review-item"><p>Questions are being prepared...</p></article>';
}

async function getCurrentQuestion() {
  const idx = app.session.current_question_index;
  const rows = await sb(`live_questions?session_id=eq.${app.sessionId}&order_index=eq.${idx}&select=*`);
  return rows[0] || null;
}

function timeLeftSec() {
  if (!app.session.question_started_at) return app.session.time_limit_sec;
  const startMs = new Date(app.session.question_started_at).getTime();
  return Math.max(0, app.session.time_limit_sec - Math.floor((Date.now() - startMs) / 1000));
}

function topicVisual(topic) {
  const t = (topic || "").toLowerCase();
  if (t.includes("nominativ")) return "🧩";
  if (t.includes("akkusativ")) return "🎯";
  if (t.includes("dativ")) return "🧭";
  if (t.includes("modal")) return "🎛️";
  if (t.includes("separable") || t.includes("trenn")) return "✂️";
  if (t.includes("word") || t.includes("wort")) return "🔀";
  return "🇩🇪";
}

function setTimerRing(elTimer, secondsLeft, total) {
  if (!elTimer) return;
  const pct = total > 0 ? Math.round((secondsLeft / total) * 100) : 0;
  elTimer.dataset.progress = String(Math.max(0, Math.min(100, pct)));
  elTimer.textContent = `${secondsLeft}s`;
}

function stopUiTimer() {
  if (app.uiTimer) {
    clearInterval(app.uiTimer);
    app.uiTimer = null;
  }
}

function refreshLiveUi() {
  if (!app.session || app.session.status !== "active") return;
  const left = timeLeftSec();
  const total = app.session.time_limit_sec;
  if (app.role === "host") {
    setTimerRing(el.hostTimer, left, total);
  }
  if (app.role === "player") {
    setTimerRing(el.playerTimer, left, total);
    const answered = app.playerAnsweredIndex === app.session.current_question_index;
    [...el.playerAnswerGrid.querySelectorAll(".answer-btn")].forEach((btn) => {
      btn.disabled = answered || left <= 0;
    });
  }
}

function maybeStartUiTimer() {
  if (app.session?.status !== "active") {
    stopUiTimer();
    return;
  }
  if (app.uiTimer) return;
  app.uiTimer = setInterval(refreshLiveUi, 250);
}

function renderAnswerButtons(container, choices, options) {
  const { disabled, onPick } = options;
  container.innerHTML = "";
  const labels = ["A", "B", "C", "D"];
  choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `answer-btn answer-shape${idx % 4}`;
    btn.disabled = Boolean(disabled);
    const inner = document.createElement("span");
    inner.className = "answer-inner";
    const lab = document.createElement("span");
    lab.className = "answer-label";
    lab.textContent = labels[idx] || String(idx + 1);
    const text = document.createElement("span");
    text.className = "answer-text";
    text.textContent = choice;
    inner.appendChild(lab);
    inner.appendChild(text);
    btn.appendChild(inner);
    if (onPick) {
      btn.onclick = () => onPick(choice, btn);
    }
    container.appendChild(btn);
  });
}

async function renderHostLive() {
  showScreen(el.hostLiveScreen);
  const q = await getCurrentQuestion();
  if (!q) return;
  const idx = app.session.current_question_index;
  const startedAt = app.session.question_started_at;
  const left = timeLeftSec();
  setTimerRing(el.hostTimer, left, app.session.time_limit_sec);
  if (app.shownQuestionIndex === idx && app.lastQuestionStartedAt === startedAt) {
    maybeStartUiTimer();
    return;
  }
  app.shownQuestionIndex = idx;
  app.lastQuestionStartedAt = startedAt;
  el.hostProgress.textContent = `Question ${idx}/${app.session.question_count}`;
  if (el.hostQuestionVisual) el.hostQuestionVisual.textContent = topicVisual(q.topic);
  el.hostQuestionText.textContent = q.question;
  renderAnswerButtons(el.hostAnswerGrid, q.choices, { disabled: true });
  maybeStartUiTimer();
}

async function renderPlayerQuestion() {
  showScreen(el.playerQuestionScreen);
  const q = await getCurrentQuestion();
  if (!q) return;
  const idx = app.session.current_question_index;
  const startedAt = app.session.question_started_at;
  const left = timeLeftSec();
  setTimerRing(el.playerTimer, left, app.session.time_limit_sec);
  if (app.shownQuestionIndex === idx && app.lastQuestionStartedAt === startedAt) {
    maybeStartUiTimer();
    return;
  }
  app.shownQuestionIndex = idx;
  app.lastQuestionStartedAt = startedAt;
  el.playerProgress.textContent = `Question ${idx}/${app.session.question_count}`;
  el.playerScore.textContent = `Score: ${app.playerScore}`;
  if (el.playerQuestionVisual) el.playerQuestionVisual.textContent = topicVisual(q.topic);
  el.playerQuestionText.textContent = q.question;
  const answeredAlready = app.playerAnsweredIndex === app.session.current_question_index;
  renderAnswerButtons(el.playerAnswerGrid, q.choices, {
    disabled: answeredAlready || left <= 0,
    onPick: (choice) => {
      submitAnswer(q, choice);
    },
  });
  maybeStartUiTimer();
}

async function submitAnswer(q, selected) {
  if (app.playerAnsweredIndex === app.session.current_question_index) return;
  const remaining = timeLeftSec();
  const correct = selected === q.answer;
  const points = correct ? 100 + remaining * 5 : 0;
  await sb("live_answers", "POST", [{
    session_id: app.sessionId,
    player_id: app.playerId,
    question_index: app.session.current_question_index,
    selected_answer: selected,
    is_correct: correct,
    points,
  }]);
  app.playerScore += points;
  await sb(`live_players?id=eq.${app.playerId}`, "PATCH", { total_score: app.playerScore });
  app.playerAnsweredIndex = app.session.current_question_index;
  [...el.playerAnswerGrid.querySelectorAll(".answer-btn")].forEach((btn) => {
    const label = btn.querySelector(".answer-text");
    const text = label ? label.textContent : btn.textContent;
    btn.disabled = true;
    if (text === q.answer) btn.classList.add("answer-correct");
    if (text === selected && text !== q.answer) btn.classList.add("answer-wrong");
  });
  el.playerScore.textContent = `Score: ${app.playerScore}`;
}

async function renderResults() {
  showScreen(el.resultsScreen);
  clearInterval(app.pollId);
  stopUiTimer();
  const players = await sb(`live_players?session_id=eq.${app.sessionId}&order=total_score.desc,created_at.asc&select=*`);
  el.resultsTitle.textContent = `Session ${app.session.join_code} completed.`;
  el.resultsLeaderboard.innerHTML = players.length
    ? players
        .map((p, i) => {
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
          const podium = i === 0 ? "podium-1" : i === 1 ? "podium-2" : i === 2 ? "podium-3" : "";
          return `<article class="review-item ${podium}"><p class="podium-line"><span class="podium-medal">${medal}</span><strong>#${i + 1} ${p.nickname}</strong></p><p class="podium-score">${p.total_score} pts</p></article>`;
        })
        .join("")
    : '<article class="review-item"><p>No results.</p></article>';

  if (app.role === "host") {
    app.insights = await buildInsights();
    renderInsightsSummary(app.insights);
    el.hostInsightsPanel.classList.remove("hidden");
    el.downloadInsightsBtn.classList.remove("hidden");
  } else {
    el.hostInsightsPanel.classList.add("hidden");
    el.downloadInsightsBtn.classList.add("hidden");
  }
}

async function buildInsights() {
  const [questions, answers, players] = await Promise.all([
    sb(`live_questions?session_id=eq.${app.sessionId}&order=order_index.asc&select=*`),
    sb(`live_answers?session_id=eq.${app.sessionId}&select=*`),
    sb(`live_players?session_id=eq.${app.sessionId}&select=*`),
  ]);

  const byIndex = new Map();
  questions.forEach((q) => byIndex.set(q.order_index, q));
  const questionStats = new Map();
  answers.forEach((a) => {
    const q = byIndex.get(a.question_index);
    if (!q) return;
    const key = `${q.order_index}`;
    if (!questionStats.has(key)) {
      questionStats.set(key, { orderIndex: q.order_index, topic: q.topic, question: q.question, total: 0, correct: 0 });
    }
    const stat = questionStats.get(key);
    stat.total += 1;
    if (a.is_correct) stat.correct += 1;
  });

  const questionRows = [...questionStats.values()].map((s) => ({
    ...s,
    correctRate: s.total ? s.correct / s.total : 0,
  }));
  const topicMap = new Map();
  questionRows.forEach((row) => {
    if (!topicMap.has(row.topic)) topicMap.set(row.topic, { topic: row.topic, total: 0, correct: 0 });
    const t = topicMap.get(row.topic);
    t.total += row.total;
    t.correct += row.correct;
  });
  const topicRows = [...topicMap.values()].map((t) => ({
    ...t,
    correctRate: t.total ? t.correct / t.total : 0,
  }));

  topicRows.sort((a, b) => a.correctRate - b.correctRate);
  questionRows.sort((a, b) => a.correctRate - b.correctRate);

  return {
    playerCount: players.length,
    answerCount: answers.length,
    hardestTopic: topicRows[0] || null,
    easiestTopic: topicRows[topicRows.length - 1] || null,
    hardestQuestion: questionRows[0] || null,
    easiestQuestion: questionRows[questionRows.length - 1] || null,
    topicRows,
    questionRows,
  };
}

function pct(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function renderInsightsSummary(insights) {
  if (!insights) return;
  const cards = [];
  if (insights.hardestTopic) {
    cards.push(
      `<article class="insight-card"><p class="insight-title">Hardest Topic: ${insights.hardestTopic.topic}</p><p class="insight-sub">Correct rate: ${pct(insights.hardestTopic.correctRate)}. Focus revision here.</p></article>`
    );
  }
  if (insights.easiestTopic) {
    cards.push(
      `<article class="insight-card"><p class="insight-title">Easiest Topic: ${insights.easiestTopic.topic}</p><p class="insight-sub">Correct rate: ${pct(insights.easiestTopic.correctRate)}.</p></article>`
    );
  }
  if (insights.hardestQuestion) {
    cards.push(
      `<article class="insight-card"><p class="insight-title">Hardest Question (Q${insights.hardestQuestion.orderIndex})</p><p>${insights.hardestQuestion.question}</p><p class="insight-sub">Correct rate: ${pct(insights.hardestQuestion.correctRate)}</p></article>`
    );
  }
  if (insights.easiestQuestion) {
    cards.push(
      `<article class="insight-card"><p class="insight-title">Easiest Question (Q${insights.easiestQuestion.orderIndex})</p><p>${insights.easiestQuestion.question}</p><p class="insight-sub">Correct rate: ${pct(insights.easiestQuestion.correctRate)}</p></article>`
    );
  }
  el.hostInsightsSummary.innerHTML = cards.join("");
}

function downloadInsightsPdf() {
  if (!app.insights) return;
  const jspdfRef = window.jspdf;
  if (!jspdfRef || !jspdfRef.jsPDF) {
    alert("PDF library not loaded yet. Please try again.");
    return;
  }
  const { jsPDF } = jspdfRef;
  const doc = new jsPDF();
  let y = 16;
  const line = (text) => {
    doc.text(text, 14, y);
    y += 7;
    if (y > 280) {
      doc.addPage();
      y = 16;
    }
  };
  line(`German A1 Quiz Insights - Session ${app.session.join_code}`);
  line(`Players: ${app.insights.playerCount} | Answers: ${app.insights.answerCount}`);
  y += 3;
  line(`Hardest Topic: ${app.insights.hardestTopic ? `${app.insights.hardestTopic.topic} (${pct(app.insights.hardestTopic.correctRate)})` : "N/A"}`);
  line(`Easiest Topic: ${app.insights.easiestTopic ? `${app.insights.easiestTopic.topic} (${pct(app.insights.easiestTopic.correctRate)})` : "N/A"}`);
  y += 3;
  line("Topic performance:");
  app.insights.topicRows.forEach((t) => line(`- ${t.topic}: ${pct(t.correctRate)} (${t.correct}/${t.total})`));
  y += 3;
  line("Question difficulty (hardest to easiest):");
  app.insights.questionRows.forEach((q) =>
    line(`- Q${q.orderIndex}: ${pct(q.correctRate)} (${q.correct}/${q.total}) | ${q.question}`)
  );
  doc.save(`quiz-insights-${app.session.join_code}.pdf`);
}

function resetHome() {
  clearInterval(app.pollId);
  stopUiTimer();
  app.role = null;
  app.session = null;
  app.sessionId = null;
  app.playerId = null;
  app.playerScore = 0;
  app.playerAnsweredIndex = null;
  app.shownQuestionIndex = null;
  app.lastQuestionStartedAt = null;
  app.insights = null;
  el.hostInsightsPanel.classList.add("hidden");
  el.downloadInsightsBtn.classList.add("hidden");
  el.hostInsightsSummary.innerHTML = "";
  showScreen(el.roleScreen);
}

function prefillJoinFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const join = params.get("join");
  if (join) {
    el.joinCode.value = join.toUpperCase();
    showScreen(el.joinScreen);
    el.joinError.textContent = "";
  }
}

el.openHostBtn.addEventListener("click", () => showScreen(el.hostSetupScreen));
el.openJoinBtn.addEventListener("click", () => {
  showScreen(el.joinScreen);
  el.joinError.textContent = "";
});
el.hostBackBtn.addEventListener("click", () => showScreen(el.roleScreen));
el.joinBackBtn.addEventListener("click", () => showScreen(el.roleScreen));
el.createSessionBtn.addEventListener("click", createHostSession);
el.copyJoinLinkBtn.addEventListener("click", copyJoinLink);
el.startLiveQuizBtn.addEventListener("click", startLiveQuiz);
el.hostNextBtn.addEventListener("click", hostNextQuestion);
el.hostEndBtn.addEventListener("click", hostEndQuiz);
el.joinSessionBtn.addEventListener("click", joinSession);
el.downloadInsightsBtn.addEventListener("click", downloadInsightsPdf);
el.restartBtn.addEventListener("click", resetHome);

renderTopicCheckboxes();
showScreen(el.roleScreen);
prefillJoinFromUrl();
