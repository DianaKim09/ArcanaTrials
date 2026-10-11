import assert from 'node:assert/strict';
import { cardWeight, drawCards, drawWeightedCard } from '../src/tarot.js';
import deck from '../data/cards.json' with { type: 'json' };

const spread = drawCards(deck, 3);

assert.equal(spread.length, 3);
assert.equal(new Set(spread.map((card) => card.name)).size, 3);
assert.ok(spread.every((card) => Array.isArray(card.keywords) && card.keywords.length > 0));
assert.ok(spread.every((card) => typeof card.upright === 'string' && typeof card.reversedMeaning === 'string'));
assert.ok(spread.every((card) => typeof card.reversed === 'boolean'));
assert.ok(deck.every((card) => (
  typeof card.scenario?.setting === 'string'
  && typeof card.scenario?.character === 'string'
  && typeof card.scenario?.dialogue === 'string'
  && typeof card.scenario?.trial?.question === 'string'
  && card.scenario.trial.question.length > 0
  && Array.isArray(card.scenario.trial.choices)
  && card.scenario.trial.choices.length === 4
  && new Set(card.scenario.trial.choices.map((choice) => choice.suit)).size === 4
  && new Set(card.scenario.trial.choices.map((choice) => choice.text)).size === 4
  && card.scenario.trial.choices.every((choice) => (
    ['Wands', 'Swords', 'Cups', 'Pentacles'].includes(choice.suit)
    && typeof choice.text === 'string'
    && choice.text.length > 0
    && typeof choice.reflection === 'string'
    && typeof choice.reaction === 'string'
  ))
  && card.scenario?.symbol
  && Array.isArray(card.scenario?.colors)
  && card.scenario.colors.length === 2
  && Object.hasOwn(card, 'image')
  && Object.hasOwn(card.scenario, 'image')
  && (card.image === null || typeof card.image === 'string')
  && (card.scenario.image === null || typeof card.scenario.image === 'string')
)));
assert.equal(new Set(deck.map((card) => card.scenario.setting)).size, deck.length);
assert.equal(new Set(deck.map((card) => card.scenario.symbol)).size, deck.length);
assert.ok(deck.every((card) => typeof card.scenario.image === 'undefined' || typeof card.scenario.image === 'string'));
assert.ok(deck.every((card) => typeof card.image === 'undefined' || typeof card.image === 'string'));

const fool = deck.find((card) => card.name === 'The Fool');
const tower = deck.find((card) => card.name === 'The Tower');
assert.ok(cardWeight(fool, 4) > cardWeight(fool, -4));
assert.ok(cardWeight(tower, 4) < cardWeight(tower, -4));

const nextCard = drawWeightedCard(deck, ['The Fool', 'The Magician'], 2);
assert.ok(!['The Fool', 'The Magician'].includes(nextCard.name));
assert.ok(typeof nextCard.reversed === 'boolean');

const wandsCard = { keywords: ['courage', 'success'] };
assert.ok(cardWeight(wandsCard, 0, { Wands: 2 }) > cardWeight(wandsCard, 0, { Cups: 2 }));
assert.equal(cardWeight(wandsCard, 0, {}), 1);

console.log('tarot spread tests passed');
