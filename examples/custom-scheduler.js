/**
 * Dummy scheduler: always review again in one day, regardless of the input.
 * Copy to scripts/custom-scheduler.js in your vault and select Custom script.
 * Replace the function body with your own scheduling logic.
 */
module.exports = ({ interval, easeFactor, reviewScore }) => {
    return { interval: 1 }; // Omit easeFactor to preserve the current value.
};
