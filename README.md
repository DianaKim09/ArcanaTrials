# Arcana Trials

An interactive tarot game. You enter short scenarios, play a quick minigame, and your performance nudges which cards you draw. Once you've collected three cards (Past / Present / Future), the game gives you a reading.

> For reflection and entertainment only. Readings are not medical, legal, or financial advice.

## Core loop

1. Ask a question or pick a theme (love, career, change, general).
2. Play a scenario minigame (20 to 40 seconds).
3. Your result weights the card draw.
4. Collect 3 cards, then reveal them one at a time (upright or reversed).
5. Receive a reading, and save it to your journal.

## Status

Early prototype. Right now the page draws 3 random Major Arcana cards and shows their meanings. Minigames and the reading engine come next.

## Run it locally

Browsers block `fetch` on `file://` pages, so serve the folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Project structure

```
data/cards.json     Card data (name, keywords, upright/reversed meaning)
docs/DESIGN.md      Design notes and roadmap
src/main.js         Game logic
index.html          Entry page
```

## Roadmap

See [docs/DESIGN.md](docs/DESIGN.md).

## Art

The Rider-Waite-Smith deck (1909) is in the public domain in the US. Card images are not included yet; add them under `assets/cards/`.

## License

Not chosen yet. Add a LICENSE file (MIT is a common choice for code).