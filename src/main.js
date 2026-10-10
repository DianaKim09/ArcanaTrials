import { POSITIONS, drawCards, loadCards } from "./tarot.js";

const state = {
  deck: [],
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderSpread(draw) {
  const spread = document.getElementById("spread");
  spread.replaceChildren();

  draw.forEach((card, i) => {
    const { name, keywords, upright, reversedMeaning } = card;
    const isReversed = Boolean(card.reversed);
    const slot = el("div", "slot");
    slot.appendChild(el("div", "slot-label", POSITIONS[i]));

    const cardEl = el("div", "card");
    const inner = el("div", "inner");

    const back = el("div", "face back", "✦");
    const front = el("div", "face front" + (isReversed ? " reversed" : ""));

    if (card.image) {
      const art = new Image();
      art.src = card.image;
      art.alt = name;
      art.className = "card-art";
      front.appendChild(art);
    }

    front.appendChild(el("h3", null, name));
    front.appendChild(el("p", "kw", keywords.join(" · ")));
    front.appendChild(el("p", "meaning", isReversed ? reversedMeaning : upright));

    inner.append(back, front);
    cardEl.appendChild(inner);
    cardEl.addEventListener("click", () => cardEl.classList.toggle("flipped"));
    slot.appendChild(cardEl);
    spread.appendChild(slot);
  });
}

async function ensureDeckLoaded() {
  if (state.deck.length) return state.deck;

  state.deck = await loadCards();
  return state.deck;
}

document.getElementById("draw").addEventListener("click", async () => {
  try {
    const deck = await ensureDeckLoaded();
    renderSpread(drawCards(deck, 3));
  } catch (error) {
    const spread = document.getElementById("spread");
    spread.textContent = error.message || "Could not draw the cards.";
  }
});

ensureDeckLoaded().catch(() => {
  const spread = document.getElementById("spread");
  spread.textContent =
    "Could not load cards. Serve this folder with: python3 -m http.server 8000";
});