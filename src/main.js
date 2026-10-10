import { drawWeightedCard, loadCards } from "./tarot.js";

const READING_POSITIONS = [
  "What shaped you",
  "What you're facing",
  "Where your choices lead",
];

const TOPIC_LABELS = {
  career: "your career",
  future: "your future",
  love: "your love life",
  growth: "your personal growth",
  change: "a change you're considering",
};

const CHOICES = [
  {
    text: "Ask a clarifying question and listen before choosing.",
    reflection: "asking a clarifying question and listening before choosing",
    value: 2,
  },
  {
    text: "Trust your instinct and move forward with confidence.",
    reflection: "trusting your instinct and moving forward with confidence",
    value: 1,
  },
  {
    text: "Pause, gather more information, and wait for the right moment.",
    reflection: "pausing to gather more information before acting",
    value: 0,
  },
  {
    text: "Confront the tension directly and deal with it head-on.",
    reflection: "confronting the tension directly and dealing with it head-on",
    value: -1,
  },
];

const state = {
  deck: [],
  topic: "",
  context: "",
  score: 0,
  cards: [],
  choices: [],
  currentCard: null,
  currentCardChoices: [],
  decisionIndex: 0,
};

const startPanel = document.getElementById("start-panel");
const readingPanel = document.getElementById("reading-panel");
const progress = document.getElementById("progress");
const trial = document.getElementById("trial");
const summary = document.getElementById("summary");
const status = document.getElementById("status");
const form = document.getElementById("reading-form");
const startButton = document.getElementById("start-reading");
const modal = document.getElementById("card-modal");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function selectedMeaning(card) {
  return card.reversed ? card.reversedMeaning : card.upright;
}

function resetReading() {
  state.topic = "";
  state.context = "";
  state.score = 0;
  state.cards = [];
  state.choices = [];
  state.currentCard = null;
  state.currentCardChoices = [];
  state.decisionIndex = 0;
  startPanel.hidden = false;
  readingPanel.hidden = true;
  trial.replaceChildren();
  summary.replaceChildren();
  summary.hidden = true;
  progress.textContent = "";
  status.textContent = "";
}

function showCardPopup(card, index) {
  state.currentCard = card;
  state.currentCardChoices = [];
  state.decisionIndex = 0;

  document.getElementById("modal-position").textContent =
    `Card ${index + 1} of 3 · ${READING_POSITIONS[index]}`;
  document.getElementById("modal-card-name").textContent =
    `${card.name}${card.reversed ? " (reversed)" : ""}`;
  document.getElementById("modal-keywords").textContent = card.keywords.join(" · ");
  document.getElementById("modal-meaning").textContent = selectedMeaning(card);

  const art = document.getElementById("modal-art");
  art.hidden = !card.image;
  art.removeAttribute("src");
  art.alt = card.image ? `Illustration of ${card.name}` : "";
  if (card.image) art.src = card.image;

  if (!modal.open) modal.showModal();
}

function drawNextCard() {
  const usedNames = state.cards.map((card) => card.name);
  const card = drawWeightedCard(state.deck, usedNames, state.score);
  state.cards.push(card);
  showCardPopup(card, state.cards.length - 1);
}

function buildScenePrompt(card, keyword, index) {
  const rolePrompt = {
    0: "You are standing in a small room, barely lit by a single lamp. A stranger leans in and asks:",
    1: "The tension sharpens. Another voice cuts through the silence and asks:",
  };

  const setting = card.keywords.length > 1
    ? `this is about ${card.keywords.slice(0, 2).join(" and ")}`
    : `this is about ${keyword}`;

  return `${rolePrompt[index % 2]} “I need to know how you handle ${setting}. What do you do?”`;
}

function renderDecision() {
  const card = state.currentCard;
  const keyword = card.keywords[state.decisionIndex] || card.keywords[0];
  const scenePrompt = buildScenePrompt(card, keyword, state.decisionIndex);

  const scene = el("div", "scene-card");
  const frame = el("div", "scene-frame");
  const art = new Image();
  art.className = "scene-art";
  art.alt = `First-person scene illustration for ${card.name}`;
  art.src = card.sceneImage || "assets/scenes/scene-placeholder.svg";

  const bubble = el("div", "dialogue-bubble");
  bubble.appendChild(el("span", "npc-label", "NPC"));
  bubble.appendChild(el("span", null, scenePrompt));

  frame.append(art, bubble);
  scene.appendChild(frame);
  scene.appendChild(el("p", "scene-caption", `From your point of view, the situation is about ${keyword}. The general tension is that you must act without pretending the problem is smaller than it is.`));

  trial.replaceChildren(
    el("h2", "trial-heading", `${card.name}'s trial`),
    el("p", "context", `A reflection on ${card.keywords.join(" and ")}. ${state.context}`.trim()),
    el("p", "prompt", `Decision ${state.decisionIndex + 1} of 2: answer the NPC in front of you.`),
    scene,
  );

  const choices = el("div", "choices");
  CHOICES.forEach((choice) => {
    const button = el("button", "choice", choice.text);
    button.type = "button";
    button.addEventListener("click", () => recordChoice(choice));
    choices.appendChild(button);
  });
  trial.appendChild(choices);
}

function recordChoice(choice) {
  state.score += choice.value;
  state.currentCardChoices.push(choice);
  state.choices.push({
    card: state.currentCard.name,
    decision: state.decisionIndex + 1,
    reflection: choice.reflection,
  });
  state.decisionIndex += 1;

  if (state.decisionIndex < 2) {
    renderDecision();
    return;
  }

  renderTrialComplete();
}

function renderTrialComplete() {
  const card = state.currentCard;
  const reflections = state.currentCardChoices.map((choice) => choice.reflection);
  trial.replaceChildren(
    el("h2", "trial-heading", "Trial complete"),
    el(
      "p",
      "context",
      `For ${card.name}, you chose ${reflections[0]}, then ${reflections[1]}. Keep those responses in mind as the reading unfolds.`,
    ),
  );

  const next = el("button", "primary", state.cards.length === 3 ? "See your full reading" : "Draw the next card");
  next.type = "button";
  next.addEventListener("click", () => {
    if (state.cards.length === 3) {
      renderSummary();
    } else {
      drawNextCard();
    }
  });
  trial.appendChild(next);
}

function renderSummary() {
  progress.textContent = "Your three-card story";
  trial.hidden = true;
  summary.hidden = false;
  summary.replaceChildren(
    el("h2", "summary-heading", "Your reading"),
    el(
      "p",
      "summary-copy",
      `For ${state.topic}${state.context ? ` — ${state.context}` : ""}, these cards trace a possible path, not a fixed prediction.`,
    ),
  );

  state.cards.forEach((card, index) => {
    const article = el("article", "reading-card");
    article.append(
      el(
        "h3",
        null,
        `${READING_POSITIONS[index]} · ${card.name}${card.reversed ? " (reversed)" : ""}`,
      ),
      el("p", "keywords", card.keywords.join(" · ")),
      el("p", null, selectedMeaning(card)),
    );

    const cardChoices = state.choices.filter((choice) => choice.card === card.name);
    const response = cardChoices
      .map((choice) => `Decision ${choice.decision}: ${choice.reflection}`)
      .join("; ");
    article.appendChild(el("p", null, `In this trial, you experienced ${response}.`));
    summary.appendChild(article);
  });

  const synthesis = state.score > 1
    ? "Across the trials, you often leaned toward thoughtful action and staying open to new information."
    : state.score < -1
      ? "Across the trials, familiar or avoidant responses appeared more often; notice what feels ready to change, without judging yourself."
      : "Across the trials, you moved between careful reflection and decisive action, suggesting there may be more than one useful way forward.";
  summary.appendChild(el("p", "summary-copy", synthesis));

  const restart = el("button", "restart", "Start a new reading");
  restart.type = "button";
  restart.addEventListener("click", resetReading);
  summary.appendChild(restart);
}

document.getElementById("begin-trial").addEventListener("click", () => {
  modal.close();
  progress.textContent = `Card ${state.cards.length} of 3 · ${READING_POSITIONS[state.cards.length - 1]}`;
  trial.hidden = false;
  renderDecision();
});

modal.addEventListener("cancel", (event) => event.preventDefault());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "";
  startButton.disabled = true;

  try {
    if (!state.deck.length) state.deck = await loadCards();
    state.topic = TOPIC_LABELS[document.getElementById("topic").value];
    state.context = document.getElementById("context").value.trim();
    state.score = 0;
    state.cards = [];
    state.choices = [];
    startPanel.hidden = true;
    readingPanel.hidden = false;
    trial.hidden = false;
    summary.hidden = true;
    drawNextCard();
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Could not start the reading.";
    startPanel.hidden = false;
    readingPanel.hidden = true;
  } finally {
    startButton.disabled = false;
  }
});
