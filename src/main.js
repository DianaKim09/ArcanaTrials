const POSITIONS = ["Past", "Present", "Future"];
let cards = [];

async function loadCards() {
  const res = await fetch("data/cards.json");
  cards = await res.json();
}

// Fisher-Yates shuffle on a copy.
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Later: weight this draw by minigame performance (see docs/DESIGN.md).
function drawCards(n = 3) {
  return shuffle(cards).slice(0, n).map((card) => ({
    card,
    reversed: Math.random() < 0.3,
  }));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderSpread(draw) {
  const spread = document.getElementById("spread");
  spread.replaceChildren();

  draw.forEach(({ card, reversed }, i) => {
    const slot = el("div", "slot");
    slot.appendChild(el("div", "slot-label", POSITIONS[i]));

    const cardEl = el("div", "card");
    const inner = el("div", "inner");

    const back = el("div", "face back", "\u2726");
    const front = el("div", "face front" + (reversed ? " reversed" : ""));
    front.appendChild(el("h3", null, card.name));
    front.appendChild(el("p", "kw", card.keywords.join(" \u00b7 ")));
    front.appendChild(el("p", "meaning", reversed ? card.reversed : card.upright));

    inner.append(back, front);
    cardEl.appendChild(inner);
    cardEl.addEventListener("click", () => cardEl.classList.toggle("flipped"));
    slot.appendChild(cardEl);
    spread.appendChild(slot);
  });
}

document.getElementById("draw").addEventListener("click", () => {
  if (cards.length) renderSpread(drawCards());
});

loadCards().catch(() => {
  document.getElementById("spread").textContent =
    "Could not load cards. Serve this folder with: python3 -m http.server 8000";
});