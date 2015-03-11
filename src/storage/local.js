
// standard imports
var util = require("util");

// local imports
var Cache = require(__dirname + "/cache");
var errors = require(__dirname + "/errors");

/**
 * LocalCache
 *
 * a LocalCache object implements the abstract Cache but without a remote connection
 * @param options
 * @returns {Cache}
 * @constructor
 */
function LocalCache(options) {
  if (!(this instanceof LocalCache)) return new LocalCache(options);

  if (options) {} // implement

  this.remote = {};
}
util.inherits(LocalCache, Cache);

/**
 * validateConnectOptions
 *
 * ensures that the remote connect options are valid
 * @param o
 * @returns {boolean}
 */
LocalCache.prototype.validateConnectOptions = function(o) {
  return true; // local cache is local..
};

/**
 * connect
 *
 * sets up the cache to be used
 * this method is redundant
 * @param options
 * @param callback
 */
LocalCache.prototype.connect = function(options, callback) {
  if (this.validateConnectOptions(options)) {
    callback(null, true);
  } else {
    callback && callback(new errors.InvalidParametersError());
  }
};

/**
 * get
 *
 * implements get operation for local cache
 * from cache
 * @param key
 * @param options
 * @param callback
 */
LocalCache.prototype.get = function(key, options, callback) {
  if (typeof(options) === "function") callback = options;
  if (this.remote.hasOwnProperty(key)) {
    callback(null, this.remote[key]);
  } else {
    callback(new errors.CacheMissError());
  }
};

/**
 * set
 *
 * implement set operation for local cache
 * @param key
 * @param value
 * @params options
 * @param callback
 */
LocalCache.prototype.set = function(key, value, options, callback) {
  if (typeof(options) === "function") callback = options;
  this.remote[key] = value;
  callback(null, true);
};

// export module
module.exports = LocalCache;