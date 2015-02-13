
// standard import
var util = require("util");

/**
 * InvalidParametersError
 *
 * thrown when an invalid parameters are passed to a function
 * @param msg {string} message to display
 * @constructor
 */
function InvalidParametersError(msg) {
  this.name = "InvalidParametersError";
  this.message = msg || "Invalid Parameters.";
}
util.inherits(InvalidParametersError, Error);

/**
 * NotImplementedError
 *
 * thrown when function called is not implemented
 * @param msg
 * @constructor
 */
function NotImplementedError(msg) {
  this.name = "NotImplementedError";
  this.message = msg || "Not Implemented.";
}
util.inherits(NotImplementedError, Error);

/**
 * CacheError
 *
 * describes a general cache error
 * @param msg {message} message to display
 * @constructor
 */
function CacheError(msg) {
  this.name = "CacheError";
  this.message = msg || "Cache Error."
}
util.inherits(CacheError, Error);

/**
 * CacheMissError
 *
 * thrown when get called on key that doesn't exist
 * in cache
 * @param msg
 * @constructor
 */
function CacheMissError(msg) {
  this.name = "CacheMissError";
  this.message = msg || "Cache Miss."
}
util.inherits(CacheMissError, Error);

// export module
module.exports = {
  InvalidParametersError: InvalidParametersError,
  NotImplementedError: NotImplementedError,
  CacheError: CacheError,
  CacheMissError: CacheMissError
};