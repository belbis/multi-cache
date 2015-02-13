/**
 * for npm
 */
module.exports = process.env.MULTICACHE_COV ? require("./src-cov/multi") : require("./src/multi");