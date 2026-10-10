import { POSITIONS, drawWeightedCard, loadCards } from "./tarot.js";

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

const SCENE_CHOICES = [
  {
    suit: "Wands",
    text: "Take a bold first step and invite others to join you.",
    reflection: "taking a bold first step and inviting others to join",
    reaction: () => "Your bold move shifts the mood. They find the courage to follow your lead.",
  },
  {
    suit: "Swords",
    text: "Ask a direct question and look for the clearest facts.",
    reflection: "asking a direct question and looking for clear facts",
    reaction: () => "They consider your questions and help separate what is known from what is feared.",
  },
  {
    suit: "Cups",
    text: "Listen to those affected and respond with compassion.",
    reflection: "listening to those affected and responding with compassion",
    reaction: () => "They feel heard and begin to share what they truly need.",
  },
  {
    suit: "Pentacles",
    text: "Make a practical plan and work through it one step at a time.",
    reflection: "making a practical plan and taking steady steps",
    reaction: () => "They help turn your careful plan into something real and dependable.",
  },
];

const state = {
  deck: [],
  topic: "",
  context: "",
  suitScores: Object.fromEntries(POSITIONS.map((suit) => [suit, 0])),
  cards: [],
  choices: [],
  currentCard: null,
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

function sceneArtwork(scene) {
  const [start, end] = scene.colors;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${start}"/>
          <stop offset="1" stop-color="${end}"/>
        </linearGradient>
        <radialGradient id="glow">
          <stop stop-color="#fff4cb" stop-opacity=".78"/>
          <stop offset="1" stop-color="#fff4cb" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="720" height="400" fill="url(#sky)"/>
      <circle cx="530" cy="105" r="115" fill="url(#glow)"/>
      <path d="M0 300 Q150 205 305 290 T720 265 V400 H0Z" fill="#17152c" fill-opacity=".48"/>
      <path d="M0 345 Q170 260 350 335 T720 310 V400 H0Z" fill="#17152c" fill-opacity=".7"/>
      <path d="M105 345 Q185 295 264 345" fill="none" stroke="#fff0bd" stroke-opacity=".45" stroke-width="3"/>
      <circle cx="360" cy="167" r="83" fill="#17152c" fill-opacity=".24" stroke="#fff0bd" stroke-opacity=".72" stroke-width="2"/>
      <text x="360" y="198" text-anchor="middle" font-size="94" fill="#fff4cb" font-family="Georgia,serif">${scene.symbol}</text>
      <path d="M330 400 Q340 310 360 285 Q380 310 390 400" fill="#17152c" fill-opacity=".8"/>
      <circle cx="360" cy="281" r="22" fill="#17152c" fill-opacity=".84"/>
      <path d="M0 390 H720" stroke="#fff0bd" stroke-opacity=".25" stroke-width="2"/>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function cardArtwork(card) {
  const [start, end] = card.scenario.colors;
  const title = card.name.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 540">
      <defs>
        <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${start}"/>
          <stop offset="1" stop-color="${end}"/>
        </linearGradient>
        <radialGradient id="light">
          <stop stop-color="#fff4cb" stop-opacity=".65"/>
          <stop offset="1" stop-color="#fff4cb" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="360" height="540" rx="22" fill="#171326"/>
      <rect x="12" y="12" width="336" height="516" rx="18" fill="url(#card)"/>
      <circle cx="180" cy="230" r="154" fill="url(#light)"/>
      <rect x="27" y="27" width="306" height="486" rx="14" fill="none" stroke="#fff0bd" stroke-opacity=".78" stroke-width="2"/>
      <path d="M52 347 Q112 278 180 326 T308 311 V469 H52Z" fill="#17152c" fill-opacity=".44"/>
      <path d="M52 388 Q124 329 184 373 T308 358 V469 H52Z" fill="#17152c" fill-opacity=".6"/>
      <circle cx="180" cy="222" r="91" fill="#17152c" fill-opacity=".18" stroke="#fff0bd" stroke-opacity=".8" stroke-width="2"/>
      <text x="180" y="255" text-anchor="middle" font-size="104" fill="#fff4cb" font-family="Georgia,serif">${card.scenario.symbol}</text>
      <path d="M154 469 Q161 396 180 380 Q199 396 206 469Z" fill="#17152c" fill-opacity=".76"/>
      <circle cx="180" cy="374" r="19" fill="#17152c" fill-opacity=".8"/>
      <path d="M68 489 H292" stroke="#fff0bd" stroke-opacity=".65"/>
      <text x="180" y="496" text-anchor="middle" font-size="16" letter-spacing="2" fill="#fff4cb" font-family="Georgia,serif">${title}</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function setImageSource(image, source, alt) {
  image.alt = alt;
  image.onerror = () => {
    status.textContent = `Could not load image "${source}". Check that the path in cards.json is correct.`;
  };
  image.src = source;
}

function storyVisual(card, dialogue = card.scenario.dialogue) {
  const scene = card.scenario;
  const figure = el("figure", "story-visual");
  const art = el("img", "story-art");
  setImageSource(art, scene.image || sceneArtwork(scene), `${card.name}: ${scene.setting}`);
  art.width = 720;
  art.height = 400;

  const frame = el("div", "scene-frame");
  const bubble = el("div", "dialogue-bubble");
  bubble.setAttribute("aria-label", `${scene.character} says: ${dialogue}`);
  const copy = el("span", "dialogue-copy");
  copy.append(
    el("span", "npc-label", scene.character),
    el("span", "dialogue-line", dialogue),
  );
  bubble.append(el("span", "character-avatar", scene.symbol), copy);
  frame.append(art, bubble);

  figure.append(
    frame,
    el("figcaption", "scene-caption", scene.setting),
  );
  return figure;
}

function resetReading() {
  state.topic = "";
  state.context = "";
  state.suitScores = Object.fromEntries(POSITIONS.map((suit) => [suit, 0]));
  state.cards = [];
  state.choices = [];
  state.currentCard = null;
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

  document.getElementById("modal-position").textContent =
    `Card ${index + 1} of 3 · ${READING_POSITIONS[index]}`;
  document.getElementById("modal-card-name").textContent =
    `${card.name}${card.reversed ? " (reversed)" : ""}`;
  document.getElementById("modal-keywords").textContent = card.keywords.join(" · ");
  document.getElementById("modal-meaning").textContent = selectedMeaning(card);
  const tarotArt = document.getElementById("modal-tarot-art");
  tarotArt.hidden = false;
  tarotArt.removeAttribute("src");
  setImageSource(tarotArt, card.image || cardArtwork(card), `Illustration of ${card.name}`);
  const modalScene = document.getElementById("modal-scene");
  modalScene.replaceChildren(storyVisual(card));

  if (!modal.open) modal.showModal();
}

function drawNextCard() {
  const usedNames = state.cards.map((card) => card.name);
  const card = drawWeightedCard(state.deck, usedNames, 0, state.suitScores);
  state.cards.push(card);
  showCardPopup(card, state.cards.length - 1);
}

function renderDecision() {
  const card = state.currentCard;
  const choices = SCENE_CHOICES.map((choice) => ({
    ...choice,
    reaction: choice.reaction(),
  }));

  trial.replaceChildren(
    el("h2", "trial-heading", `You are there · ${card.name}'s trial`),
    el("p", "prompt", `You are making a choice about ${state.topic}. What do you do?`),
    storyVisual(card),
  );

  const choiceList = el("div", "choices");
  choices.forEach((choice) => {
    const button = el("button", "choice", choice.text);
    button.type = "button";
    button.addEventListener("click", () => recordChoice(choice));
    choiceList.appendChild(button);
  });
  trial.appendChild(choiceList);
}

function recordChoice(choice) {
  state.suitScores[choice.suit] += 1;
  state.choices.push({
    card: state.currentCard.name,
    event: state.cards.length,
    suit: choice.suit,
    reflection: choice.reflection,
    reaction: choice.reaction,
  });

  trial.replaceChildren(
    el("h2", "trial-heading", "Their response"),
    storyVisual(state.currentCard, choice.reaction),
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
    );
    const art = el("img", "tarot-art");
    setImageSource(art, card.image || cardArtwork(card), `Illustration of ${card.name}`);
    article.appendChild(art);
    article.append(
      el("p", "keywords", card.keywords.join(" · ")),
      storyVisual(
        card,
        state.choices.find((choice) => choice.card === card.name)?.reaction || card.scenario.dialogue,
      ),
      el("p", null, selectedMeaning(card)),
    );

    const cardChoices = state.choices.filter((choice) => choice.card === card.name);
    const response = cardChoices
      .map((choice) => choice.reflection)
      .join("; ");
    article.appendChild(el("p", null, `You chose ${response}.`));
    summary.appendChild(article);
  });

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
    state.suitScores = Object.fromEntries(POSITIONS.map((suit) => [suit, 0]));
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
