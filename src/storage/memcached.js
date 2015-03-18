
// standard imports
var util = require("util");

// npm imports
var MemcachedLib = require("memcached");

// local imports
var Remote = require(__dirname + "/remote").Remote;
var errors = require(__dirname + "/../errors");

/**
 * Memcached
 *
 * backend interface for MultiCache objects
 * @implements {Remote}
 * @param options
 * @returns {Memcached}
 * @constructor
 */
function Memcached(options) {
   if (!(this instanceof Memcached)) return new Memcached(options);  // don't require new

  // handle options
  options = options || {};
  this.serverLocations = options.serverLocations || "127.0.0.1:11211";
  this.remote = null;
}
util.inherits(Memcached, Remote);

/**
 * connect
 *
 * connect the Memcached to remote data source
 * @param options {object} options
 * @param callback {function} next step
 */
Memcached.prototype.connect = function(options, callback) {
  if (typeof options === "function") {
    callback = options;
  }

  if (!callback) {
    callback = function() {};
  }

  try {
    this.remote = new MemcachedLib(this.serverLocations, options);
    callback(null, true);
  } catch(e) {
    callback(e);
  }
};

/**
 * disconnect
 *
 * disconnect the storage from remote source
 * @param callback {function} next step
 */
Memcached.prototype.disconnect = function(callback) {
  this.remote = null;
  callback(null, true);
};

/**
 * setItem
 *
 * store a value at given key
 * @param key {string} key to store value
 * @param value {object} object to be stored
 * @param options {object} options
 * @param callback {function} next step
 */
Memcached.prototype.setItem = function(key, value, options, callback) {
  var ttl = 0;
  if (typeof options === "function") {
    callback = options;
  } else {
    ttl = options.lifetime || ttl;
  }
  this.remote.set(key, value, ttl, callback);
};

/**
 * setItemSync
 *
 * store value at given key synchronously
 * @param key
 * @param value
 * @param options
 */
Memcached.prototype.setItemSync = function(key, value, options) {
  throw new errors.NotImplementedError();
};

/**
 * getItem
 *
 * retrieve a value of given key
 * @param key {string} key who's value to be fetched
 * @param options {object} options
 * @param callback {function} next step
 */
Memcached.prototype.getItem = function(key, options, callback) {
  if (typeof options === "function") {
    callback = options;
  }
  this.remote.get(key, callback);
};

/**
 * getItemSync
 *
 * retrieve the value stored at key synchronously
 * @param key {string} key who's value to be fetched
 * @param options {object} options
 */
Memcached.prototype.getItemSync = function(key) {
  throw new errors.NotImplementedError();
};

/**
 * removeItem
 *
 * deletes a given key from storage
 * @param key {string} key to be deleted
 * @param callback {function} next step
 */
Memcached.prototype.removeItem = function(key, callback) {
  this.remote.del(key, callback);
};

/**
 * removeItemSync
 *
 * deletes the value stored at key synchronously
 * @param key
 */
Memcached.prototype.removeItemSync = function(key) {
  throw new errors.NotImplementedError();
};

/**
 * expire
 *
 * set the expiration for key
 * @param key {string}
 * @param expiration {number}
 * @param callback {function} next step
 */
Memcached.prototype.expire = function(key, expiration, callback) {
  this.remote.touch(key, expiration, callback);
};

/**
 * expireSync
 *
 * set the expiration for key synchronously
 */
Memcached.prototype.expireSync = function(key, expiration) {
  throw new errors.NotImplementedError();
};

/**
 * clear
 *
 * flushes the cache
 * @param callback {function} next step
 */
Memcached.prototype.clear = function(callback) {
  this.remote.flush(callback);
};

/**
 * clearSync
 *
 * clears the storage synchronously
 */
Memcached.prototype.clearSync = function() {
  throw new errors.NotImplementedError();
};


/**
 * key
 *
 * return the nth key in the storage
 * @param n {number} index to fetch key
 * @param callback {function} the next step
 */
Memcached.prototype.key = function(n, callback) {
  callback(new errors.NotImplementedError());
};

/**
 * keySync
 *
 * return the nth key in the storage synchronously
 * @param n {number} index to fetch key
 */
Memcached.prototype.keySync = function(n) {
  throw new errors.NotImplementedError();
};

module.exports = {
  Memcached: Memcached
};