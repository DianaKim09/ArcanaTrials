import { POSITIONS, drawWeightedCard, loadCards } from "./tarot.js";

//summary area sections , aslo shown in the tarot card area pop up
const READING_POSITIONS = [
  "What shaped you",
  "What you're facing",
  "Where your choices lead",
];

// drop down labels for the topic select menu
const TOPIC_LABELS = {
  career: "your career",
  future: "your future",
  love: "your love life",
  growth: "your personal growth",
  change: "a change you're considering",
};

//advice given based on the suite that was chosen most
const ADVICE_BY_SUIT = {
  Wands: "Choose one promising idea and take a small first step toward it.",
  Swords: "Separate what you know from what you assume, then make a clear decision.",
  Cups: "Keep listening to your feelings and the people affected, while making room for your own needs.",
  Pentacles: "Turn what you have learned into a practical next step you can sustain.",
};

// contains the current state of the reading
// such as (deck of cards, selected topic,
//  scores for each suit, cards drawn, choices made,
//  & the current card being displayed.
const state = {
  deck: [],
  topic: "",
  suitScores: Object.fromEntries(POSITIONS.map((suit) => [suit, 0])),
  cards: [],
  choices: [],
  currentCard: null,
};
//identifies the elements that will be used display the visuals
const startPanel = document.getElementById("start-panel");
const readingPanel = document.getElementById("reading-panel");
const progress = document.getElementById("progress");
const trial = document.getElementById("trial");
const summary = document.getElementById("summary");
const status = document.getElementById("status");
const form = document.getElementById("reading-form");
const startButton = document.getElementById("start-reading");
const modal = document.getElementById("card-modal");

// creates a new HTML element with the specified tag,  class name, and text content
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function selectedMeaning(card) {
  return card.reversed ? card.reversedMeaning : card.upright;
}

// generates an SVG  image for a scene based on its colors and symbol
// (scalable vector graphic) --> idsplays 2d grpahics on web
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
// sets the source
// text for an image element
function setImageSource(image, source, alt) {
  image.alt = alt;
  image.onerror = () => {
    //handles errors if the image cannot be loaded
    status.textContent = `Could not load image "${source}". Check that the path in cards.json is correct.`;
  };
  image.src = source;
}

// creates a visual representation of a card's scenario
// including the scene's image and dialogue
function storyVisual(card, dialogue = card.scenario.dialogue) {
  const scene = card.scenario;
  const figure = el("figure", "story-visual");
  const art = el("img", "story-art");
  setImageSource(art, scene.image || sceneArtwork(scene), `${card.name}: ${scene.setting}`);
  art.width = 720;
  art.height = 400;

  const frame = el("div", "scene-frame");
  frame.append(art);
  if (dialogue) {
    const bubble = el("div", "dialogue-bubble");
    bubble.setAttribute("aria-label", `${scene.character} says: ${dialogue}`);
    const copy = el("span", "dialogue-copy");
    copy.append(
      el("span", "npc-label", scene.character),
      el("span", "dialogue-line", dialogue),
    );
    bubble.append(el("span", "character-avatar", scene.symbol), copy);
    frame.appendChild(bubble);
  }

  figure.append(
    frame,
    el("figcaption", "scene-caption", scene.setting),
  );
  return figure;
}


function resetReading() {
  state.topic = "";
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

//gets elements from the DOM node (an element object)
// and displays the card popup with the card's details n scenario
function showCardPopup(card, index) {
  state.currentCard = card;

  document.getElementById("modal-position").textContent =
    `Card ${index + 1} of 3 · ${READING_POSITIONS[index]}`;
  document.getElementById("modal-card-name").textContent =
    `${card.name}${card.reversed ? " (reversed)" : ""}`;
  document.getElementById("modal-meaning").textContent = selectedMeaning(card);
  const tarotArt = document.getElementById("modal-tarot-art");
  tarotArt.hidden = !card.image;
  tarotArt.removeAttribute("src");
  if (card.image) setImageSource(tarotArt, card.image, `Illustration of ${card.name}`);
  const modalScene = document.getElementById("modal-scene");
  const dialogue = card.scenario.dialogue === selectedMeaning(card)
    ? ""
    : card.scenario.dialogue;
  modalScene.replaceChildren(storyVisual(card, dialogue));

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
  const { question, choices } = card.scenario.trial;

  trial.replaceChildren(
    el("h2", "trial-heading", `You are there · ${card.name}'s trial`),
    el("p", "prompt", question),
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

function naturalList(items) {
  if (items.length < 2) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function createReadingAdvice() {
  const counts = Object.fromEntries(POSITIONS.map((suit) => [suit, 0]));
  state.choices.forEach((choice) => {
    counts[choice.suit] += 1;
  });

  const highestCount = Math.max(...Object.values(counts));
  const leadingSuits = POSITIONS.filter((suit) => counts[suit] === highestCount);
  const drawnCards = state.cards.map((card) => (
    `${card.name}${card.reversed ? " (reversed)" : ""}`
  ));
  const cardThemes = state.cards.map((card) => card.keywords[0]);
  const actionPattern = state.choices.map((choice) => choice.reflection);
  const choiceFeedback = leadingSuits.length > 1
    ? `Your choices leaned equally toward ${naturalList(leadingSuits)} (${highestCount} decision${highestCount === 1 ? "" : "s"} each).`
    : `Your choices leaned most toward ${leadingSuits[0]} (${highestCount} of ${state.choices.length} decisions).`;

  return [
    `Your spread includes ${naturalList(drawnCards)}, bringing themes of ${naturalList(cardThemes)}.`,
    `${choiceFeedback} Your actions included ${naturalList(actionPattern)}.`,
    leadingSuits.map((suit) => ADVICE_BY_SUIT[suit]).join(" "),
  ];
}

//same thing uses dom
function renderSummary() {
  progress.textContent = "Your three-card story";
  trial.hidden = true;
  summary.hidden = false;
  summary.replaceChildren(
    el("h2", "summary-heading", "Your reading"),
    el(
      "p",
      "summary-copy",
      `For ${state.topic}, these cards trace a possible path, not a fixed prediction.`,
    ),
  );

  const advice = el("section", "advice-panel");
  const adviceHeading = el("h3", null, "Advice");
  adviceHeading.id = "advice-title";
  advice.setAttribute("aria-labelledby", adviceHeading.id);
  advice.append(adviceHeading);
  createReadingAdvice().forEach((text) => {
    advice.appendChild(el("p", null, text));
  });
  summary.appendChild(advice);

  state.cards.forEach((card, index) => {
    const article = el("article", "reading-card");
    article.append(
      el(
        "h3",
        null,
        `${READING_POSITIONS[index]} · ${card.name}${card.reversed ? " (reversed)" : ""}`,
      ),
    );
    article.append(
      el("p", "keywords", card.keywords.join(" · ")),
      storyVisual(
        card,
        state.choices.find((choice) => choice.card === card.name)?.reaction || card.scenario.dialogue,
      ),
      el("p", null, selectedMeaning(card)),
    );
    if (card.image) {
      const art = el("img", "tarot-art");
      setImageSource(art, card.image, `Illustration of ${card.name}`);
      article.appendChild(art);
    }

    const cardChoices = state.choices.filter((choice) => choice.card === card.name);
    const response = cardChoices
      .map((choice) => choice.reflection)
      .join("; ");
    article.appendChild(el("p", null, `Your response: ${response}.`));
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
