
// standard imports
var util = require("util");

// npm imports
var redis = require("redis");

// local imports
var Remote = require(__dirname + "/remote").Remote;
var errors = require(__dirname + "/../errors");

/**
 * Redis
 *
 * backend interface for MultiCache objects
 * @implements {Remote}
 * @param options
 * @returns {Redis}
 * @constructor
 */
function Redis(options) {
  if (!(this instanceof Redis)) return new Redis(options);  // don't require new

  // handle options
  options = options || {};
  this.port = options.port || 6379;
  this.host = options.host || "127.0.0.1";
  this.db = options.db || 0;
}
util.inherits(Redis, Remote);

/**
 * connect
 *
 * connect the Redis to remote data source
 * @param options {object} options
 * @param callback {function} next step
 */
Redis.prototype.connect = function(options, callback) {
  if (typeof options === "function") {
    callback = options;
  }

  if (!callback) {
    callback = function() {};
  }

  try {
    this.remote = redis.createClient(this.port, this.host, options);
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
Redis.prototype.disconnect = function(callback) {
  this.remote.end();
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
Redis.prototype.setItem = function(key, value, options, callback) {
  if (typeof options === "function") {
    callback = options;
  }
  this.remote.set(key, value, callback);
};

/**
 * setItemSync
 *
 * store a value at given key synchronously
 * @param key
 * @param value
 * @param options
 */
Redis.prototype.setItemSync = function(key, value, options) {
  throw new errors.NotImplementedError();
};

/**
 * getItem
 *
 * retrieve the value stored at key
 * @param key {string} key who's value to be fetched
 * @param options {object} options
 * @param callback {function} next step
 */
Redis.prototype.getItem = function(key, options, callback) {
  if (typeof options === "function") {
    callback = options;
  }
  this.remote.get(key, callback);
};

/**
 * getItemSync
 *
 * retrive the value stored at key synchronously
 * @param key
 * @param options
 */
Redis.prototype.getItemSync = function(key, options) {
  throw new errors.NotImplementedError();
};

/**
 * removeItem
 *
 * deletes a given key from storage
 * @param key {string} key to be deleted
 * @param callback {function} next step
 */
Redis.prototype.removeItem = function(key, callback) {
  this.remote.del(key, callback);
};

/**
 * removeItemSync
 *
 * deletes the value stored at key synchronously
 * @param key
 */
Redis.prototype.removeItemSync = function(key) {
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
Redis.prototype.expire = function(key, expiration, callback) {
  var cmd = "EXPIRE " + key + " " + expiration;
  this.remote.eval(cmd, callback);
};

/**
 * expireSync
 *
 * set the expiration for key synchronously
 */
Redis.prototype.expireSync = function(key, expiration) {
  throw new errors.NotImplementedError();
};

/**
 * clear
 *
 * flushes the cache
 * @param callback {function} next step
 */
Redis.prototype.clear = function(callback) {
  this.remote.flushdb(callback);
};

/**
 * clearSync
 *
 * clears the storage synchronously
 */
Redis.prototype.clearSync = function() {
  throw new errors.NotImplementedError();
};

// export module
module.exports = {
  Redis: Redis
};