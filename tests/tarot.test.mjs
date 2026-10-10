import assert from 'node:assert/strict';
import { drawCards } from '../src/tarot.js';
import deck from '../data/cards.json' with { type: 'json' };

const spread = drawCards(deck, 3);

assert.equal(spread.length, 3);
assert.equal(new Set(spread.map((card) => card.name)).size, 3);
assert.ok(spread.every((card) => Array.isArray(card.keywords) && card.keywords.length > 0));
assert.ok(spread.every((card) => typeof card.upright === 'string' && typeof card.reversedMeaning === 'string'));
assert.ok(spread.every((card) => typeof card.reversed === 'boolean'));

console.log('tarot spread tests passed');
