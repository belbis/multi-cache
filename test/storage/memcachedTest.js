/**
 * unit tests for Memcached
 */

// local imports
var storage = require(__dirname + "/../../").storage;
var errors = require(__dirname + "/../../").errors;

/**
 * stub for remote operations
 * @type {object}
 */
var MemcachedStub = {
  cache: new storage.Local(),
  set: function(key, value, ttl, callback) {
    this.cache.setItem(key, value, callback);
  },
  get: function(key, callback) {
    this.cache.getItem(key, callback);
  },
  del: function(key, callback) {
    this.cache.removeItem(key, callback);
  },
  clear: function() {
    this.cache = new storage.Local();
    return this;
  }
};

/**
 * constructorTest
 *
 * simulate constructor call
 * @param test
 */
var constructorTest = function(test) {
  test.expect(6);

  // instanceof
  var c = new storage.Memcached({});
  test.ok(c instanceof storage.Memcached);
  test.ok(c instanceof storage.Storage);

  var c2 = storage.Memcached({
    serverLocations: ["localhost:11211", "127.0.0.1:11211"]
  });
  test.ok(c2 instanceof storage.Memcached);
  test.ok(c2 instanceof storage.Storage);

  // defaults
  test.equal(c.serverLocations, "127.0.0.1:11211");

  // params
  test.deepEqual(c2.serverLocations, ["localhost:11211", "127.0.0.1:11211"]);

  test.done();
};

/**
 * connectTest
 *
 * simulate connect call
 * @param test
 */
var connectTest = function(test) {
  var num = 2;
  test.expect(num*2);

  var mc = new storage.Memcached({});

  var disconnectCallback = function(e,r) {
    if (--num===0) test.done();
  };

  var connectCallback = function(e,r) {
    test.equal(e, null);
    test.ok(r);
    mc.disconnect(disconnectCallback);
  };

  mc.connect(null, connectCallback);
  mc.connect(connectCallback);
};

/**
 * setItemTest
 *
 * simulate setItem call
 * @param test
 */
var setItemTest = function(test) {
  test.expect(1);

  var mc = new storage.Memcached({});
  mc.remote = MemcachedStub.clear();

  var setCallback = function(e,r) {
    test.equal(e, null);
    test.done();
  };
  mc.setItem("key", {foo: "bar"}, setCallback);
};

/**
 * emptyGetItemTest
 *
 * simulates getItem on key not
 * stored in db
 * @param test
 */
var emptyGetItemTest = function(test) {
  test.expect(1);

  var mc =new storage.Memcached({});
  mc.remote = MemcachedStub.clear();
  var errGetCallback = function(e, r) {
    test.ok(e instanceof errors.CacheMissError); // NOTE: stub uses Memcached, so handler will assign this as error
    test.done();
  };
  mc.getItem("key", errGetCallback);
};

/**
 * getItemTest
 *
 * simulateGetItem call
 * @param test
 */
var getItemTest = function(test) {
  test.expect(3);
  var mc =new storage.Memcached({});
  mc.remote= MemcachedStub.clear();
  var getCallback = function(e,r) {
    test.equal(e,null);
    test.deepEqual(r, {"foo": "bar"});
    test.done();
  };
  var setCallback = function(e,r) {
    test.equal(e, null);
    mc.getItem("key", getCallback);
  };
  mc.setItem("key", {"foo": "bar"}, setCallback);
};

/**
 * clearTest
 *
 * simulates clearing memcached
 * @param test
 */
var clearTest = function(test) {
  test.expect(1);
  var mc = new storage.Memcached({});
  var remoteStub = {
    flush: function(cb) {
      test.ok(1);
      cb(null, true);
    }
  };
  mc.remote = remoteStub;
  var clearCallback = function() {
    test.done();
  };
  mc.clear(clearCallback);
};

/**
 * expireTest
 *
 * simulate expiration update to key
 */
var expireTest = function(test) {
  test.expect(1);
  var mc = new storage.Memcached();
  var remoteStub = {
    touch: function(k,e,cb) {
      test.ok(1);
      cb(null,true);
    }
  };
  mc.remote = remoteStub;
  var expireCallback = function() {
    test.done();
  };
  mc.expire("foo", 0, expireCallback);
};

/**
 * removeItemTest
 *
 * simulate removing an item from cache
 * @param test
 */
var removeItemTest = function(test) {
  var mc = new storage.Memcached();
  mc.remote = MemcachedStub;
  var badGetCallback = function(e,r) {
    test.ok(e instanceof errors.CacheMissError);
    test.done()
  };
  var removeItemCallback = function(e,r) {
    if (e) throw e;
    mc.getItem("foo", badGetCallback);
  };
  var goodGetCallback = function(e,r) {
    if (e) throw e;
    test.equal(r, "bar");
    mc.removeItem("foo", removeItemCallback);
  };
  var setItemCallback = function(e,r) {
    if (e) throw e;
    mc.getItem("foo", goodGetCallback);
  };
  mc.setItem("foo", "bar", setItemCallback);
};

/**
 * notImplementedTest
 *
 * show unimplemented features
 * @param test
 */
var notImplementedTest = function(test) {
  var num = 1;
  test.expect(num);
  var mc = new storage.Memcached();
  var callback = function(e,r) {
    test.ok(e instanceof errors.NotImplementedError);
    if (--num===0) test.done();
  };
  mc.key(0, callback);
};

/**
 * notImplementedTest
 *
 * show unimplemented sync features
 * @param test
 */
var notImplementedSyncTest = function(test) {
  test.expect(6);
  var mc = new storage.Memcached();
  var willThrow1 = function() {
    mc.setItemSync("foo", "bar");
  };
  var willThrow2 = function() {
    mc.getItemSync("foo");
  };
  var willThrow3 = function() {
    mc.removeItemSync("foo");
  };
  var willThrow4 = function() {
    mc.expireSync("foo");
  };
  var willThrow5 = function() {
    mc.clearSync();
  };
  var willThrow6 = function() {
    mc.keySync(0);
  };
  test.throws(willThrow1, errors.NotImplementedError);
  test.throws(willThrow2, errors.NotImplementedError);
  test.throws(willThrow3, errors.NotImplementedError);
  test.throws(willThrow4, errors.NotImplementedError);
  test.throws(willThrow5, errors.NotImplementedError);
  test.throws(willThrow6, errors.NotImplementedError);
  test.done();
};

// export module
module.exports = {
  constructorTest: constructorTest,
  connectTest: connectTest,
  setItemTest: setItemTest,
  getItemTest: getItemTest,
  removeItemTest: removeItemTest,
  emptyGetItemTest: emptyGetItemTest,
  expireTest: expireTest,
  clearTest: clearTest,
  notImplementedTest: notImplementedTest,
  notImplementedSyncTest: notImplementedSyncTest
};