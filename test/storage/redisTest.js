/**
 * unit tests for Redis
 */

// local imports
var storage = require(__dirname + "/../../").storage;
var errors = require(__dirname + "/../../").errors;

/**
 * stub for remote operations
 * @type {object}
 */
var RedisStub = {
  cache: new storage.Local(),
  set: function(key, value, callback) {
    this.cache.setItem(key, value, callback);
  },
  get: function(key, callback) {
    this.cache.getItem(key, callback);
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
  test.expect(10);

  // instanceof
  var c = new storage.Redis({});

  test.ok(c instanceof storage.Redis);
  test.ok(c instanceof storage.Storage);

  var c2 = storage.Redis({
    host: "newhost",
    port: "newport",
    db: 1
  });
  test.ok(c2 instanceof storage.Redis);
  test.ok(c2 instanceof storage.Storage);

  // defaults
  test.equal(c.host, "127.0.0.1");
  test.equal(c.port, 6379);
  test.equal(c.db, 0);

  // params
  test.equal(c2.host, "newhost");
  test.equal(c2.port, "newport");
  test.equal(c2.db, 1);

  test.done();
};

/**
 * connectTest
 *
 * simulate connection to remote redis
 * @param test
 */
var connectTest = function(test) {
  var n = 2;
  test.expect(n*2);

  var rc = new storage.Redis({});
  var disconnectCallback = function(e,r) {
    if (--n === 0) test.done();
  };

  var connectCallback = function(e, r) {
    test.equal(e, null);
    test.ok(r);
    rc.disconnect(disconnectCallback);
  };

  rc.connect(null, connectCallback);
  rc.connect(connectCallback);
  // rc.connect();
};

/**
 * setItemTest
 *
 * simulates setItem calls
 * @param test
 */
var setItemTest = function(test) {
  test.expect(1);
  var rc =new storage.Redis({});
  rc.remote = RedisStub.clear();
  var setCallback = function(e,r) {
    test.equal(e, null);
    test.done();
  };
  rc.setItem("key", {foo: "bar"}, setCallback);
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

  var rc =new storage.Redis({});
  rc.remote = RedisStub.clear();
  var errGetCallback = function(e, r) {
    test.ok(e instanceof errors.CacheMissError); // NOTE: stub uses Redis, so handler will assign this as error
    test.done();
  };
  rc.getItem("key", errGetCallback);
};

/**
 * getItemTest
 *
 * simulate getItem calls
 * @param test
 */
var getItemTest = function(test) {
  test.expect(2);

  var rc =new storage.Redis({});
  rc.remote= RedisStub.clear();
  var getCallback = function(e,r) {
    test.equal(e,null);
    test.done();
  };
  var setCallback = function(e,r) {
    test.equal(e, null);
    rc.getItem("key", getCallback);
  };
  rc.setItem("key", {"foo": "bar"}, setCallback);
};

/**
 * clearTest
 *
 * simulates clear calls
 * @param test
 */
var clearTest = function(test) {
  test.expect(1);
  var remoteStub = {
    flushdb: function(cb) {
      test.ok(1);
      cb(null, true);
    }
  };
  var rc = new storage.Redis();
  var clearCallback = function() {
    test.done();
  };
  rc.remote = remoteStub;
  rc.clear(clearCallback);
};

/**
 * expireTest
 *
 * simulate expiration update to key
 */
var expireTest = function(test) {
  test.expect(1);
  var rc = new storage.Redis();
  var remoteStub = {
    eval: function(c,cb) {
      test.ok(1);
      cb(null,true);
    }
  };
  rc.remote = remoteStub;
  var expireCallback = function() {
    test.done();
  };
  rc.expire("foo", 0, expireCallback);
};

/**
 * removeItemTest
 *
 * simulate removeItem call
 */
var removeItemTest = function(test) {
  test.expect(1);
  var rc = new storage.Redis();
  var key = "foo";
  var remoteStub = {
    del: function(k,cb) {
      test.equal(k, key);
      cb(null, true);
    }
  };
  var removeItemCallback = function() {
    test.done();
  };
  rc.remote = remoteStub;
  rc.removeItem("foo", removeItemCallback)
};

/**
 * notImplementedTest
 *
 * ensure unimplemented features error
 * @param test
 */
var notImplementedTest = function(test) {
  test.expect(5);
  var rc = new storage.Redis();
  var willThrow1 = function() {
    rc.setItemSync("foo", "bar");
  };
  var willThrow2 = function() {
    rc.getItemSync("foo");
  };
  var willThrow3 = function() {
    rc.removeItemSync("foo");
  };
  var willThrow4 = function() {
    rc.expireSync("foo");
  };
  var willThrow5 = function() {
    rc.clearSync();
  };
  test.throws(willThrow1, errors.NotImplementedError);
  test.throws(willThrow2, errors.NotImplementedError);
  test.throws(willThrow3, errors.NotImplementedError);
  test.throws(willThrow4, errors.NotImplementedError);
  test.throws(willThrow5, errors.NotImplementedError);
  test.done();
};

// export module
module.exports = {
  constructorTest: constructorTest,
  connectTest: connectTest,
  setItemTest: setItemTest,
  getItemTest: getItemTest,
  emptyGetItemTest: emptyGetItemTest,
  clearTest: clearTest,
  expireTest: expireTest,
  removeItemTest: removeItemTest,
  notImplementedTest: notImplementedTest
};