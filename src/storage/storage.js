
// local imports
var errors = require(__dirname + "/../errors");

/**
 * Storage
 *
 * interface for backend to multicache objects
 * extends the webstorage interface as defined here:
 * http://dev.w3.org/html5/webstorage/#the-storage-interface
 * @interface
 * @extends {webStorage} -- DOM spec web storage
 * @param options
 * @returns {Storage}
 * @constructor
 */
function Storage(options) {}

/**
 * length
 *
 * number of key/value pairs stored
 * @type {null}
 */
Storage.prototype.length = 0;

/**
 * key
 *
 * return the nth key in the storage
 * @param n {number} index to search for key
 * @param callback {function} next step
 */
Storage.prototype.key = function(n, callback) {};

/**
 * keySync
 *
 * return the nth key in the storage synchronously
 * @param n
 */
Storage.prototype.keySync = function(n) {};

/**
 * setItem
 *
 * store a value at given key
 * @param key {string} key to store value
 * @param value {object} object to be stored
 * @param options {object} options
 * @param callback {function} next step
 */
Storage.prototype.setItem = function(key, value, options, callback) {};

/**
 * setItemSync
 *
 * store value at given key synchronously
 * @param key
 * @param value
 * @param options
 */
Storage.prototype.setItemSync = function(key, value, options) {};

/**
 * getItem
 *
 * retrieve the value stored at key
 * @param key {string} key who's value to be fetched
 * @param options {object} options
 * @param callback {function} next step
 */
Storage.prototype.getItem = function(key, options, callback) {};

/**
 * getItemSync
 *
 * retrieve the value stored at key synchronously
 * @param key
 * @param options
 */
Storage.prototype.getItemSync = function(key, options) {};

/**
 * removeItem
 *
 * deletes the value stored at key
 * @param key {string} key to be deleted
 * @param callback {function} next step
 */
Storage.prototype.removeItem = function(key, callback) {};

/**
 * removeItemSync
 *
 * deletes the value stored at key synchronously
 * @param key
 */
Storage.prototype.removeItemSync = function(key) {};

/**
 * expire
 *
 * set the expiration for key
 * @param key {string}
 * @param expiration {number}
 * @param callback {function} next step
 */
Storage.prototype.expire = function(key, expiration, callback) {};

/**
 * expireSync
 *
 * set the expiration for key synchronously
 */
Storage.prototype.expireSync = function(key, expiration) {};

/**
 * clear
 *
 * clears the storage
 * @param callback {function} next step
 */
Storage.prototype.clear = function(callback) {};

/**
 * clearSync
 *
 * clears the storage synchronously
 */
Storage.prototype.clearSync = function() {};

module.exports = {
  Storage: Storage
};