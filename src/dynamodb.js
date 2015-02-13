
// standard imports
var util = require("util");

// local imports
var Cache = require(__dirname + "/cache");
var errors = require(__dirname + "/errors");

// npm imports
var AWS = require("aws-sdk");
var Dynamizer = require("dynamizer");

/**
 * DynamoDBCache
 *
 * a cache that uses DynamoDB as its remote source
 * uses a dynamizer object to encode
 * @param options
 * @returns {Cache}
 * @constructor
 */
function DynamoDBCache(options) {
  if (!(this instanceof DynamoDBCache)) return new DynamoDBCache(options);

  if (options) {
    this.table = options.table || "table";
    this.hashKey = options.hashKey || "id";
    this.metaKey = options.metaKey || "_meta"; // info not needed by result
  } else {
    throw new errors.InvalidParametersError();
  }

  this.dynamizer = Dynamizer();
}
util.inherits(DynamoDBCache, Cache);

/**
 * validateConnectOptions
 *
 * ensures that the connection options are valid
 * @param o
 */
DynamoDBCache.prototype.validateConnectOptions = function(o) {
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
 */
DynamoDBCache.prototype.connect = function(options) {
  if (this.validateConnectOptions(options)) {
    this.remote = new AWS.DynamoDB(options);
  } else {
    throw new errors.InvalidParametersError;
  }
};

/**
 * disconnect
 *
 * disconnects from remote data source
 */
DynamoDBCache.prototype.disconnect = function() {
  delete this.remote;
};

/**
 * set
 *
 * implements set cache for dynamodb
 * @param key -- key
 * @param value -- value to be set
 * @param options -- extra options
 * @param callback -- function to be called on completion
 */
DynamoDBCache.prototype.set = function(key, value, options, callback) {
  if (typeof(options) === "function") callback = options;

  var params = this._construct_set_params(key, value);
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
 * _construct_set_params
 *
 * helper to construct set parameters
 * @param key
 * @param value
 * @returns {object} a valid object to be used in putItem operation
 * @private
 */
DynamoDBCache.prototype._construct_set_params = function(key, value) {

  // put key into value
  if (value.constructor === Object) {
    value[this.hashKey] = key;
    for (var i in value) {
      if (value.hasOwnProperty(i)) {
        value[i] = this.dynamizer.encode(value[i]);
      }
    }
  } else { // construct object
    var o = {};
    o[this.hashKey] = this.dynamizer.encode(key);
  }

  return {
    TableName: this.table,
    Item: value,
  };
};

/**
 * _construct_get_params
 *
 * helper to construct get parameters
 * @param key
 * @returns  valid params object for get request
 * @private
 */
DynamoDBCache.prototype._construct_get_params = function(key) {
  // set up dynamo fetch
  var p = {
    TableName: this.table//,
    //"Key": this.dynamizer.encodeKey(this.hashKey, key)
  };
  p["Key"] =  {};
  p["Key"][this.hashKey] = this.dynamizer.encode(key);
  return p;
};

/**
 * get
 *
 * implemeents set cache for dynamodb
 * @param key -- key whose value to be fetched
 * @param options -- extra options to consider
 * @param callback -- function to be invoked on completion
 */
DynamoDBCache.prototype.get = function(key, options, callback) {

  if (typeof(options) === "function") callback = options;

  var params = this._construct_get_params(key);

  // for callback
  var self = this;

  var getItemCallback = function(e, r) {
    if (e) {
      callback(new errors.CacheError(e.message));
    } else if (Object.keys(r).length === 0) {
      callback(new errors.CacheMissError());
    } else if (r.hasOwnProperty("Item")) {
      callback(null, self.dynamizer.decode(r.Item));
    } else { // TODO: necessary?
      callback(new CacheError("Invalid Return Type"));
    }
  };
  this.remote.getItem(params, getItemCallback);
};

// export module
module.exports = DynamoDBCache;