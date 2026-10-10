# Arcana Trials

An interactive tarot game. You enter short scenarios, play a quick minigame, and your performance nudges which cards you draw. Once you've collected three cards (Past / Present / Future), the game gives you a reading.

> For reflection and entertainment only. Readings are not medical, legal, or financial advice.

## Core loop

1. Choose a topic (career, future, love life, personal growth, or a possible change) and optionally add context.
2. Reveal one tarot card and enter its illustrated, first-person scenario.
3. Meet a character, choose among four responses, and see their reaction; your choice subtly influences the next card.
4. Complete three scenes, with each card upright or reversed.
5. Read the three-card interpretation and a recap of your choices and their consequences.

## Status

The prototype supports a complete three-card reading flow. Every tarot card has its own tarot-style illustration, illustrated scenario, and character dialogue. Choose among four responses, see the character react, and let your choices subtly influence the remaining draws.

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

Every card already has both fields. Set the card-level `image` to a path such as `"assets/cards/the-fool.png"` to use your tarot artwork in the reveal and reading. Set `scenario.image` to `"assets/scenes/the-fool.png"` to use your scene background behind the character dialogue. Create those folders and add the PNGs yourself. Leave either value as `null` to keep that card's built-in generated illustration. This is an author-side code/data setting; players cannot upload or change images in the game.

## License

Not chosen yet. Add a LICENSE file (MIT is a common choice for code).