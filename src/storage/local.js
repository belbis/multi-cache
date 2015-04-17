
// standard imports
var util = require("util");

// local imports
var Storage = require(__dirname + "/storage").Storage;
var errors = require(__dirname + "/../errors");

/**
 * Local
 *
 * local storage for MultiCache
 * @param options
 * @returns {Local}
 * @implements {Storage}
 * @constructor
 */
function Local(options) {
  if (!(this instanceof Local)) return new Local(options);  // don't require new
  this.remote = {};
  this.keys = [];
  this.__defineGetter__("length", function() {
    return this.keys.length;
  });
}
util.inherits(Local, Storage);

/**
 * getItem
 *
 * retrieve the value stored at key
 * @param key {string} key who's value to be fetched
 * @param options {object} options
 * @param callback {function} next step
 */
Local.prototype.getItem = function(key, options, callback) {
  if (typeof(options) === "function") {
    callback = options;
  }
  if (this.remote.hasOwnProperty(key)) {
    var o = this.remote[key];
    var cur = Date.now();
    if (o._meta.lastUpdated + (o._meta.expire * 1000) <= cur) {
      callback(null, o.val);
    } else {
      callback(new errors.CacheMissError());
    }
  } else {
    callback(new errors.CacheMissError());
  }
};

/**
 * getItemSync
 *
 * retrieve the value stored at key synchronously
 * @param key {string} key who's value to be fetched
 * @param options {object} options
 */
Local.prototype.getItemSync = function(key, options) {
  if (this.remote.hasOwnProperty(key)) {
    var o = this.remote[key];
    var cur = Date.now();
    if (o._meta.lastUpdated + (o._meta.expire*1000) <= cur) {
      return o.val;
    } else {
      throw new errors.CacheMissError();
    }
  } else {
    throw new errors.CacheMissError();
  }
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
Local.prototype.setItem = function(key, value, options, callback) {
  if (typeof(options) === "function") {
    callback = options;
  }

  if (!this.remote.hasOwnProperty(key)) {
    this.keys.push(key);
  }

  this.remote[key] = this._createStorageItem(value);
  callback(null, true);
};

/**
 * setItemSync
 *
 * store a value at given key synchronously
 * @param key {string} key to store value
 * @param value {object} object to be stored
 * @param options {object} options
 */
Local.prototype.setItemSync = function(key, value, options) {
  if (!this.remote.hasOwnProperty(key)) {
    this.keys.push(key);
  }
  this.remote[key] = this._createStorageItem(value);
  return true;
};

/**
 * _createStorageItem
 *
 * creates a storage item for local storage
 * @param value
 * @returns {{_meta: {idx: number, expire: number, lastUpdated: number}, val: *}}
 * @private
 */
Local.prototype._createStorageItem = function(value) {
  return {
    _meta: {
      idx: this.keys.length-1,
      expire: -1,
      lastUpdated: Date.now()
    },
    val: value
  };
};

/**
 * removeItem
 *
 * deletes the value stored at key
 * @param key {string} key to be deleted
 * @param callback {function} next step
 */
Local.prototype.removeItem = function(key, callback) {
  var idx = this.keys.indexOf(key);
  if (idx > -1) {
    this.keys.splice(idx);
    delete this.remote[key];
  }
  callback(null, idx);
};

/**
 * removeItemSync
 *
 * deletes the value stored at key synchronously
 * @param key {string} key to be deleted
 */
Local.prototype.removeItemSync = function(key) {
  var idx = this.keys.indexOf(key);
  if (idx > -1) {
    this.keys.splice(idx);
    delete this.remote[key];
  }
  return idx;
};

/**
 * key
 *
 * return the nth key in storage
 * @param n
 * @param callback
 */
Local.prototype.key = function(n, callback) {
  if (n>=this.keys.length) {
    callback(null, null);
  } else {
    callback(null, this.keys[n]);
  }
};

/**
 * keySync
 *
 * return the nth key in storage synchronously
 * @param n
 * @returns {*}
 */
Local.prototype.keySync = function(n) {
  if (n>=this.keys.length) {
    return null;
  } else {
    return this.keys[n];
  }
};

/**
 * expire
 *
 * set the expiration for key
 * @param key {string}
 * @param expiration {number}
 * @param callback {function} next step
 */
Local.prototype.expire = function(key, expiration, callback) {
  this._expire(key, expiration);
  callback(null, true);
};

/**
 * expireSync
 *
 * set the expiration for key synchronously
 */
Local.prototype.expireSync = function(key, expiration) {
  this._expire(key, expiration);
  return true;
};

/**
 * _expire
 *
 * expire and expireSync perform the same action
 * so it is performed here
 * @param key
 * @param expiration
 * @private
 */
Local.prototype._expire = function(key, expiration) {
  if (this.remote.hasOwnProperty(key)) {
    var cur = this.remote[key];
    cur._meta.lastUpdated = Date.now();
    cur._meta.expire = expiration;
  }
};

/**
 * clear
 *
 * flushes the cache. DynamoDB doesn't have flush
 * capability, so deleting the table and recreating
 * it are better options
 * @param callback {function} next step
 */
Local.prototype.clear = function(callback) {
  this.keys.length = 0;
  this.remote = {};
  callback(null, true);
};

/**
 * clearSync
 *
 * clears the storage synchronously
 */
Local.prototype.clearSync = function() {
  this.keys.length = 0;
  this.remote = {};
  return true;
};

// export module
module.exports = {
  Local: Local
};