

// local imports
var errors = require(__dirname + "/errors"),
  NotImplementedError = errors.NotImplementedError;

/**
 * Cache
 *
 * interface for working with caches
 * @param options
 * @returns {Cache}
 * @constructor
 */
function Cache(options) {
  if (!(this instanceof Cache)) return new Cache(options);

  // handle options
  if (options) {}

  this.remote = {}; // remote cache interface
}

/**
 * connect
 *
 * connect the cache to remote data source
 * @param options
 * @param callback
 */
Cache.prototype.connect = function(options, callback) {
  throw new NotImplementedError();
};

/**
 * set
 *
 * store a value at given key
 * @param key
 * @param value
 * @param options
 * @param callback
 */
Cache.prototype.set = function(key, value, options, callback) {
  throw new NotImplementedError();
};

/**
 * get
 *
 * retrieve a value of given key
 * @param key
 * @param options
 * @param callback
 */
Cache.prototype.get = function(key, options, callback) {
  throw new NotImplementedError();
};

module.exports = Cache;