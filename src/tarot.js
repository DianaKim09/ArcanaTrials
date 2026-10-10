export const POSITIONS = ["Wands", "Swords", "Cups", "Pentacles"];

const SUIT_KEYWORDS = {
  Wands: new Set([
    "beginnings", "opportunity", "courage", "willpower", "vision", "success",
    "awakening", "transformation", "drive", "ambition",
  ]),
  Swords: new Set([
    "focus", "clarity", "truth", "conflict", "unfair", "overthinking",
    "uncertainty", "doubting", "accountability", "decision",
  ]),
  Cups: new Set([
    "trust", "nurture", "healing", "hope", "joy", "attachment", "intuition",
    "dreams", "love",
  ]),
  Pentacles: new Set([
    "skill", "abundance", "growth", "balance", "patience", "completion",
    "fulfillment", "integration", "structure", "grounding",
  ]),
};

export function shuffle(list) {
  const deck = [...list];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCards(deck, n = 3) {
  if (!Array.isArray(deck) || deck.length === 0) {
    throw new Error("No cards are available to draw.");
  }

  if (deck.length < n) {
    throw new Error(`Not enough cards in the deck to draw ${n}.`);
  }

  return shuffle(deck)
    .slice(0, n)
    .map((card) => ({
      ...card,
      reversed: Math.random() < 0.35,
    }));
}

const UPLIFTING_KEYWORDS = new Set([
  "beginnings", "trust", "opportunity", "skill", "focus", "abundance", "growth",
  "nurture", "courage", "resilience", "guidance", "willpower", "cycles", "balance",
  "healing", "renewal", "hope", "vision", "joy", "clarity", "success", "purpose",
  "completion", "fulfillment", "integration", "patience", "manifestation",
]);

const CHALLENGING_KEYWORDS = new Set([
  "fear", "impulsiveness", "blocked", "misused", "rigidity", "conflict", "stalled",
  "isolation", "unfair", "stubbornness", "avoided", "attachment", "shadow",
  "disruption", "doubting", "uncertainty", "resisting", "overthinking",
]);

export function cardWeight(card, score = 0, suitScores = {}) {
  const affinity = card.keywords.reduce((total, keyword) => {
    if (UPLIFTING_KEYWORDS.has(keyword)) return total + 1;
    if (CHALLENGING_KEYWORDS.has(keyword)) return total - 1;
    return total;
  }, 0);
  const normalizedAffinity = Math.max(-1, Math.min(1, affinity / 2));
  const boundedScore = Math.max(-6, Math.min(6, score));
  const generalWeight = Math.exp(boundedScore * normalizedAffinity * 0.3);
  const suitAffinity = Object.entries(SUIT_KEYWORDS).reduce((total, [suit, keywords]) => {
    const matches = card.keywords.filter((keyword) => keywords.has(keyword)).length;
    const boundedSuitScore = Math.max(0, Math.min(3, suitScores[suit] || 0));
    return total + boundedSuitScore * Math.min(1, matches / 2);
  }, 0);

  return generalWeight * Math.exp(suitAffinity * 0.3);
}

export function drawWeightedCard(deck, excludedNames = [], score = 0, suitScores = {}) {
  if (!Array.isArray(deck) || deck.length === 0) {
    throw new Error("No cards are available to draw.");
  }

  const available = deck.filter((card) => !excludedNames.includes(card.name));
  if (available.length === 0) {
    throw new Error("No undrawn cards remain.");
  }

  const weights = available.map((card) => cardWeight(card, score, suitScores));
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  let selection = Math.random() * totalWeight;
  const selectedIndex = weights.findIndex((weight) => {
    selection -= weight;
    return selection < 0;
  });
  const card = available[selectedIndex === -1 ? available.length - 1 : selectedIndex];

  return { ...card, reversed: Math.random() < 0.35 };
}

export async function loadCards() {
  const response = await fetch("./data/cards.json");

  if (!response.ok) {
    throw new Error("Could not load the tarot deck.");
  }

  const deck = await response.json();
  if (!Array.isArray(deck) || deck.length === 0) {
    throw new Error("The deck file is empty.");
  }

  return deck;
}
