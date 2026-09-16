/**
 * A starting policy for developing notes, using the plugin's default scores.
 * Copy this file into your vault as scripts/evergreen.js, then choose it in a
 * Custom spacing method. These intervals are tunable heuristics, not a claim
 * about optimal timing. Omitted easeFactor preserves the note's existing ease.
 */
module.exports = ({ interval, reviewScore }) => {
    const maximumDays = 90;
    switch (reviewScore) {
        case 1: // Fruitful: continue the thought tomorrow.
            return { interval: 1 };
        case 3: // Ignore: give the thought a little more time.
            return { interval: Math.min(maximumDays, Math.max(1, interval * 1.5)) };
        case 5: // Unfruitful: let it simmer for longer.
            return { interval: Math.min(maximumDays, Math.max(1, interval * 2)) };
        default:
            throw new Error('Evergreen example expects scores 1 (Fruitful), 3 (Ignore), or 5 (Unfruitful).');
    }
};
