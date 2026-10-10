# Arcana Trials

An interactive tarot game. You enter short scenarios, play a quick minigame, and your performance nudges which cards you draw. Once you've collected three cards (Past / Present / Future), the game gives you a reading.

> For reflection and entertainment only. Readings are not medical, legal, or financial advice.

## Core loop

1. Choose a topic (career, future, love life, personal growth, or a possible change) and optionally add context.
2. Reveal one tarot card and play its two-choice reflection trial.
3. Your choices quietly influence the next card drawn.
4. Complete three trials, with each card upright or reversed.
5. Read the three-card interpretation and a recap of the choices you made.

## Status

The prototype supports a complete three-card reading flow. Each card prompts two scenario decisions, and those choices influence the remaining draws and shape the closing reflection.

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