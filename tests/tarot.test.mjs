import assert from 'node:assert/strict';
import { cardWeight, drawCards, drawWeightedCard } from '../src/tarot.js';
import deck from '../data/cards.json' with { type: 'json' };

const spread = drawCards(deck, 3);

assert.equal(spread.length, 3);
assert.equal(new Set(spread.map((card) => card.name)).size, 3);
assert.ok(spread.every((card) => Array.isArray(card.keywords) && card.keywords.length > 0));
assert.ok(spread.every((card) => typeof card.upright === 'string' && typeof card.reversedMeaning === 'string'));
assert.ok(spread.every((card) => typeof card.reversed === 'boolean'));

const fool = deck.find((card) => card.name === 'The Fool');
const tower = deck.find((card) => card.name === 'The Tower');
assert.ok(cardWeight(fool, 4) > cardWeight(fool, -4));
assert.ok(cardWeight(tower, 4) < cardWeight(tower, -4));

const nextCard = drawWeightedCard(deck, ['The Fool', 'The Magician'], 2);
assert.ok(!['The Fool', 'The Magician'].includes(nextCard.name));
assert.ok(typeof nextCard.reversed === 'boolean');

console.log('tarot spread tests passed');
