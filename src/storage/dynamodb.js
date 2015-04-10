
// standard imports
var util = require("util");

// local imports
var Remote = require(__dirname + "/remote").Remote;
var errors = require(__dirname + "/../errors");

// npm imports
var uuid = require("uuid");
var AWS = require("aws-sdk");
var Dynamizer = require("dynamizer");

/**
 * DynamoDB
 *
 * dynamodb storage for MultiCache
 * uses a dynamizer object to encode
 * @implements {Remote}
 * @param options
 * @returns {DynamoDB}
 * @constructor
 */
function DynamoDB(options) {
  if (!(this instanceof DynamoDB)) return new DynamoDB(options);  // don't require new

  // handle options
  options = options || {};
  this.table = options.table || "table";
  this.hashKey = options.hashKey || "id";
  this.metaKey = options.metaKey || "_meta"; // info not needed by result
  this.dataKey = options.dataKey || "_data";

  this.dynamizer = Dynamizer();
}
util.inherits(DynamoDB, Remote);

/**
 * validateConnectOptions
 *
 * ensures that the connection options are valid
 * @param o
 */
DynamoDB.prototype.validateConnectOptions = function(o) {
  return o &&
         o.hasOwnProperty("accessKeyId") &&
         o.hasOwnProperty("secretAccessKey") &&
         o.hasOwnProperty("region");
};

/**
 * connect
 *
 * connect to DynamoDB
 * @param options -- the connect options required for dynamodb
 * @param callback
 */
DynamoDB.prototype.connect = function(options, callback) {
  if (this.validateConnectOptions(options)) {
    this.remote = new AWS.DynamoDB(options);
    callback(null, true);
  } else {
    callback(new errors.InvalidParametersError());
  }
};

/**
 * disconnect
 *
 * disconnect the storage from remote source
 * @param callback {function} next step
 */
DynamoDB.prototype.disconnect = function(callback) {
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
DynamoDB.prototype.setItem = function(key, value, options, callback) {
  if (typeof(options) === "function") callback = options;

  var params = this._constructSetParams(key, value);
  var putItemCallback = function(e,r) {
    if (e) {
      callback(new errors.CacheError(e.message));
    } else {
      callback(null, r);
    }
  };
  this.remote.putItem(params, putItemCallback);
};

/**
 * setItemSync
 *
 * store value at given key synchronously
 * @param key
 * @param value
 * @param options
 */
DynamoDB.prototype.setItemSync = function(key, value, options) {
  throw new errors.NotImplementedError();
};

/**
 * _constructSetParams
 *
 * helper to construct set parameters
 * @param key
 * @param value
 * @returns {object} a valid object to be used in putItem operation
 * @private
 */
DynamoDB.prototype._constructSetParams = function(key, value, meta) {

  // put key into value
  var o = {};
  meta = meta || {
    expire: -1,
    lastUpdated: (new Date).getTime(),
    rev: uuid.v4().split("-").join("")
  };
  o[this.dataKey] = this.dynamizer.encode(value);
  o[this.metaKey] = this.dynamizer.encode(meta);
  o[this.hashKey] = this.dynamizer.encode(key);
  return {
    TableName: this.table,
    Item: o
  };
};

/**
 * _constructGetParams
 *
 * helper to construct get parameters
 * @param key
 * @returns  {object} valid params object for get request
 * @private
 */
DynamoDB.prototype._constructGetParams = function(key) {
  // set up dynamo fetch
  var p = {
    TableName: this.table//,
    //"Key": this.dynamizer.encodeKey(this.hashKey, key)
  };
  p.Key =  {};
  p.Key[this.hashKey] = this.dynamizer.encode(key);
  return p;
};

/**
 * getItem
 *
 * retrieve the value stored at key
 * @param key {string} key who's value to be fetched
 * @param options {object} options
 * @param callback {function} next step
 */
DynamoDB.prototype.getItem = function(key, options, callback) {
  var cur = (new Date).getTime();
  if (typeof(options) === "function") callback = options;

  var self = this;
  var params = this._constructGetParams(key);

  var getItemCallback = function(e, r) {
    if (e) {
      callback(new errors.CacheError(e.message));

    } else if (Object.keys(r).length === 0) {
      callback(new errors.CacheMissError());
    } else if (r.hasOwnProperty("Item")) {

      var ret = self._stripMeta(r, cur);
      if (ret instanceof Error) {
        callback(ret);
      } else {
        callback(null, ret);
      }
    } else { // TODO: something unexpected happened
      //callback(new CacheError("Invalid Return Type"));
      // idk
    }
  };
  this.remote.getItem(params, getItemCallback); // use bind to avoid scope traversal?
};

/**
 * getItemSync
 *
 * retrieve the value stored at key synchronously
 * @param key {string} key who's value to be fetched
 * @param options {object} options
 */
DynamoDB.prototype.getItemSync = function(key, options) {
  throw new errors.NotImplementedError();
};

/**
 * removeItem
 *
 * deletes the value stored at key
 * @param key {string} key to be deleted
 * @param callback {function} next step
 */
DynamoDB.prototype.removeItem = function(key, callback) {
  callback(new errors.NotImplementedError());
};

/**
 * removeItemSync
 *
 * deletes the value stored at key synchronously
 * @param key
 */
DynamoDB.prototype.removeItemSync = function(key) {
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
DynamoDB.prototype.expire = function(key, expiration, callback) {
  if (typeof expiration !== "number") {
    callback(new errors.InvalidParametersError);
    return;
  }

  var self = this;
  // finally execute callback
  var setItemCallback = function(e,r) {
    if (e) {
      callback(e);
    } else {
      callback(null, true);
    }
  };

  // then update value expiration
  var getItemCallback = function(e,r) {
    if (e) {
      callback(e);
    } else {
      var o = self.dynamizer.decode(r.Item);
      var meta = {
        expire: expiration,
        lastUpdated: (new Date).getTime()
      };
      var params = self._constructSetParams(key, o, meta);
      self.remote.putItem(params, setItemCallback);
    }
  };
  // first fetch key
  // read in this ^ direction
  var params = this._constructGetParams(key);
  this.remote.getItem(params, getItemCallback);
};

/**
 * expireSync
 *
 * set the expiration for key synchronously
 */
DynamoDB.prototype.expireSync = function(key, expiration) {
  throw new errors.NotImplementedError();
};

/**
 * clear
 *
 * flushes the cache. DynamoDB doesn't have flush
 * capability, so deleting the table and recreating
 * it are better options
 * @param callback {function} next step
 */
DynamoDB.prototype.clear = function(callback) {
  callback(new errors.NotImplementedError());
};

/**
 * clearSync
 *
 * clears the storage synchronously
 */
DynamoDB.prototype.clearSync = function() {
  throw new errors.NotImplementedError();
};

/**
 * key
 *
 * return the nth key in the storage
 * @param n {number} index to fetch key
 * @param callback {function} the next step
 */
DynamoDB.prototype.key = function(n, callback) {
  callback(new errors.NotImplementedError());
};

/**
 * keySync
 *
 * return the nth key in the storage synchronously
 * @param n {number} index to fetch key
 */
DynamoDB.prototype.keySync = function(n) {
  throw new errors.NotImplementedError();
};

/**
 * _stripMeta
 *
 * strip out meta info from item
 * @private
 * @param r {object} return value of remote get
 * @param ts {number} timestamp from getItem call
 */
DynamoDB.prototype._stripMeta = function(r, ts) {
  var o = this.dynamizer.decode(r.Item);
  if (o[this.metaKey].lastUpdated + (o[this.metaKey].expire * 1000) <= ts) {
    return o[this.dataKey] || o; // if data key not found just return object
  } else {
    return new errors.CacheMissError();
  }
};

// export module
module.exports = {
  DynamoDB: DynamoDB
};