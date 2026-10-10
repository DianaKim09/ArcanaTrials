export const POSITIONS = ["Past", "Present", "Future"];

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
