
// local imports
var storage = require(__dirname + "/storage");
var errors = require(__dirname + "/errors");

/**
 * MultiCache
 *
 * multi storage cache object
 * @param options
 * @constructor
 */
function MultiCache(options) {
  options = options || {};
  if (options.storage) {
    this.setStorage(options.storage);
  }

  this.buffer = options.buffer || false;
  if (this.buffer) {
    this.local = new storage.Local();
    this.refreshRate = options.refreshRate || 10; // every 10th call update cache with remote
  }
}

/**
 * connect
 *
 * connect remote storage
 * to data source if necessary
 * @param options
 * @param callback
 */
MultiCache.prototype.connect = function(options, callback) {
  if (typeof options === "function") {
    callback = options;
  }

  if (typeof this.storage.connect === "function") { // remote storage
    this.storage.connect(options, callback);
  } else {
    callback(null, true);
  }
};

/**
 * disconnect
 *
 * disconnect remote storage
 * @param callback
 */
MultiCache.prototype.disconnect = function(callback) {
  if (!callback) callback = function() {};

  if (typeof this.storage.disconnect === "function") {
    this.storage.disconnect(callback);
  } else {
    callback (null, true);
  }
};

/**
 * get
 *
 * fetch the value stored at key
 * @param key {string} key whose value is to be fetched
 * @param options {object} options
 * @param callback {function} next step
 */
MultiCache.prototype.get = function(key, options, callback) {
  var self = this; // ode to python

  if (typeof(options) === "function") {
    callback = options;
    options = {};
  } // don't require options

  var returned = false;
  var cur;
  try {
    cur = this.local.getItemSync(key);
  } catch(e) {
    cur = null;
  }

  var getItemCallback = function(e,r) {
    try { // in case cur was updated while fetch occurred
      cur = self.local.getItemSync(key);
    } catch(err) {
      cur = null;
    }
    cur = cur || {_meta: {count: 0}};
    cur._data = e || r;
    cur._meta.count++;
    self.local.setItemSync(key, cur);
    if (!returned) callback(e,r);
  };

  if (this.buffer) {
    if (cur !== null) { // we have seen this key before
      if (++cur._meta.count > this.refreshRate) {
        cur._meta.count = 0; // reset count
        this.storage.getItem(key, options, getItemCallback);
      }
      var dat = cur._data;
      if (dat instanceof Error) {
        callback(dat);
      } else {
        callback(null, dat);
      }
      returned = true;
    } else {
      this.storage.getItem(key, options, getItemCallback);
    }
  } else {
    this.storage.getItem(key, options, callback);
  }
};

/**
 * set
 *
 * store value at key
 * @param key {string} key under which to store value
 * @param value {object} value to be stored
 * @param options {object} storage specific options
 * @param callback {function} next step
 */
MultiCache.prototype.set = function(key, value, options, callback) {
  this.storage.setItem(key, value, options, callback);
};

/**
 * setStorage
 *
 * sets the backend for this cache
 * @param s {Storage}
 */
MultiCache.prototype.setStorage = function(s) {
  if (s instanceof storage.Storage) {
    this.storage = s;
    return this;
  }
  throw new errors.InvalidParametersError("invalid storage type");
};

/**
 * expire
 *
 * set the expiration (in s) for a key
 * @param key {string} key to set expiration
 * @param expiration {number} seconds to expire
 * @param callback {function} next step
 */
MultiCache.prototype.expire = function(key, expiration, callback) {
  this.storage.expire(key, expiration, callback);
};

/**
 * remove
 *
 * remove an key from the cache
 */
MultiCache.prototype.remove = function(key, callback) {
  var self = this; // ode to python
  if (this.buffer) {
    var localDelCallback = function(e,r) {
      if (e) {
        callback(e);
      } else {
        self.local.removeItem(key, callback);
      }
    };
    this.storage.removeItem(key, localDelCallback);
  } else {
    this.storage.removeItem(key, callback);
  }
};

/**
 * clear
 *
 * clear all items from cache
 * @param callback
 */
MultiCache.prototype.clear = function(callback) {
  var self = this; // ode to python
  if (this.buffer) {
    var localClearCallback = function (e, r) {
      if (e) {
        callback(e);
      } else {
        self.local.clear(callback);
      }
    };
    this.storage.clear(localClearCallback);
  } else {
    this.storage.clear(callback);
  }
};

// export module
module.exports = {
  getCache: function(s, o) {
    o = o || {};
    if (storage.lower.hasOwnProperty(s)) return (new MultiCache(o)).setStorage(storage.lower[s](o.storageOptions));
    throw new errors.InvalidParametersError();
  },
  storage: storage,
  errors: errors
};