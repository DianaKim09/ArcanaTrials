# Arcana Trials

An interactive tarot game. You enter short scenarios, play a quick minigame, and your performance nudges which cards you draw. Once you've collected three cards (Past / Present / Future), the game gives you a reading.

> For reflection and entertainment only. Readings are not medical, legal, or financial advice.

## Core loop

1. Choose a topic (career, future, love life, personal growth, or a possible change).
2. Reveal one tarot card and enter its illustrated, first-person scenario.
3. Meet a character, answer a dilemma written for that card's scenario, and see their reaction; your choice subtly influences the next card.
4. Complete three scenes, with each card upright or reversed.
5. Read the three-card interpretation, tailored advice based on your cards and choices, and a recap of your actions.

## Status

The prototype supports a complete three-card reading flow. Every tarot card has its own tarot-style illustration, illustrated scenario, character dialogue, and tailored trial question with four distinct responses. The final reading includes advice shaped by the cards and the suits chosen during the trials.

## Run it locally

Browsers block `fetch` on `file://` pages, so serve the folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Project structure

```
data/cards.json     Card meanings and unique illustrated story scenarios
docs/DESIGN.md      Design notes and roadmap
src/main.js         Game logic
index.html          Entry page
```

## Roadmap

See [docs/DESIGN.md](docs/DESIGN.md).

## Art

The Rider-Waite-Smith deck (1909) is in the public domain in the US. Tarot card illustrations are not included yet; the story scenes use original, generated SVG artwork based on each card's scenario.

### Change card images (developer setting)

There is no image upload or image-changing control in the game. To change the art yourself, edit the `image` fields in each card entry in `data/cards.json`:

```json
{
  "name": "The Fool",
  "keywords": ["beginnings", "trust", "opportunity"],
  "upright": "You are stepping into a new chapter with curiosity and courage.",
  "reversedMeaning": "A leap forward is being blocked by fear or impulsiveness.",
  "image": null,
  "scenario": {
    "setting": "A cliffside trail forks above a bright valley.",
    "character": "The traveler",
    "dialogue": "“No map, no guarantees. Would you take the first step with me?”",
    "symbol": "➶",
    "colors": ["#a94e55", "#e4a858"],
    "image": null
  }
}
```

To import a batch of PNGs without editing JSON paths by hand:

1. Put the files in one folder. Name each tarot image after its card, in lowercase with spaces changed to hyphens: `the-fool.png`, `the-magician.png`, `wheel-of-fortune.png`.
2. If you also have a separate scenario background, add `-scene` before `.png`, for example `the-fool-scene.png`. Scenario images are optional.
3. Run this command from the project folder, replacing the example path with your image folder:

   ```bash
   python3 scripts/import_images.py ~/Downloads/tarot-pngs
   ```

The importer copies tarot art to `assets/cards/`, scenario art to `assets/scenes/`, and fills in the corresponding `image` fields in `data/cards.json`. If you intentionally want to replace images you already imported, add `--overwrite`. To import an individual file, it still needs the same card-based filename. This is a developer tool; players cannot upload or change images in the game.

Expected card-image filenames: `the-fool.png`, `the-magician.png`, `the-high-priestess.png`, `the-empress.png`, `the-emperor.png`, `the-hierophant.png`, `the-lovers.png`, `the-chariot.png`, `strength.png`, `the-hermit.png`, `wheel-of-fortune.png`, `justice.png`, `the-hanged-man.png`, `death.png`, `temperance.png`, `the-devil.png`, `the-tower.png`, `the-star.png`, `the-moon.png`, `the-sun.png`, `judgement.png`, and `the-world.png`.

Alternatively, set a card's top-level `image` path or `scenario.image` path directly in `data/cards.json`. Leave either as `null` to keep the built-in generated illustration.

## License

Not chosen yet. Add a LICENSE file (MIT is a common choice for code).