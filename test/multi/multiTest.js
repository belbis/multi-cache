/**
 * unit tests for multi cache
 * @type {{}}
 */

// local imports
var multicache = require(__dirname + "/../../");

/**
 * getCacheTest
 *
 * simulates constructor calls for different storage
 * backed caches
 * @param test
 */
var getCacheTest = function(test) {
  test.expect(9);

  var localCache = multicache.getCache("local");
  var dynamoDBCache = multicache.getCache("dynamodb");
  var redisCache = multicache.getCache("redis");
  var memcachedCache = multicache.getCache("memcached");

  test.ok(localCache.storage instanceof multicache.storage.Local);
  test.ok(dynamoDBCache.storage instanceof multicache.storage.DynamoDB);
  test.ok(redisCache.storage instanceof multicache.storage.Redis);
  test.ok(memcachedCache.storage instanceof multicache.storage.Memcached);

  var willThrow = function() {
    var c = multicache.getCache("foobar");
  };
  test.throws(willThrow, multicache.errors.InvalidParametersError);

  // defaults
  test.ok(!localCache.buffer);

  var localCache2 = multicache.getCache("local", {
    buffer: true
  });

  var localCache3 = multicache.getCache("local", {
    buffer: true,
    refreshRate: 100
  });

  // params
  test.ok(localCache2.buffer);
  test.equal(localCache2.refreshRate, 10);
  test.equal(localCache3.refreshRate, 100);

  test.done();
};

/**
 * connectTest
 *
 * simulates local connect
 * @param test
 */
var connectLocalTest = function(test) {
  var num = 2;
  test.expect(num);
  var c = multicache.getCache("local");

  var connectCallback =function() {
    test.ok(1);
    if (!--num) test.done();
  };

  c.connect(null, connectCallback);
  c.connect(connectCallback);
};

/**
 * connectRemoteTest
 *
 * simulates remote storage connection
 * @param test
 */
var connectRemoteTest = function(test) {
  test.expect(1);
  var c = multicache.getCache("local");
  c.storage.connect = function(o,c) {c(null,true)};

  var connectCallback =function(e,r) {
    test.ok(r);
    test.done();
  };
  c.connect(connectCallback);
};

/**
 * disconnectLocalTest
 *
 * simulates calling disconnect on local storage
 * @param test
 */
var disconnectLocalTest = function(test) {
  test.expect(1);
  var c = multicache.getCache("local");
  var disconnectCallback = function(e,r) {
    test.ok(r);
    test.done();
  };
  c.disconnect(disconnectCallback);
};

/**
 * disconnectRemoteTest
 *
 * simulates calling disconnect on remote storage
 * @param test
 */
var disconnectRemoteTest = function(test) {
  test.expect(1);
  var c = multicache.getCache("local");
  c.storage.disconnect = function(c) {c(null, true)};
  var disconnectCallback = function(e,r) {
    test.ok(r);
    test.done();
  };
  c.disconnect(disconnectCallback);
};

/**
 * getTest
 *
 * simulate get request
 * @param test
 */
var getTest = function(test){
  test.expect(1);
  var cache = multicache.getCache("local", {buffer: false});
  cache.get('1', function(e,r) {
    test.ok(e instanceof Error);
    test.done();
  });
};

var emptyGetTest = function(test) {
  test.expect(1);

  test.done();
};

/**
 * setTest
 *
 * simulate set
 * @param test
 */
var setTest = function(test) {
  test.expect(4);
  var m = multicache.getCache("local");
  var testKey = "key";
  var testVal = {"foo": "bar", "baz": {"bizz": "buzz"}};
  var getCallback = function(e,r) {
    test.equal(e, null);
    test.deepEqual(r, testVal);
    test.done();
  };
  var setCallback = function(e,r) {
    test.equal(e, null);
    test.ok(r);
    m.get(testKey, getCallback);
  };
  m.set(testKey, testVal, setCallback);
};

/**
 * removeTest
 *
 * simulate removing an item from the cache
 */
var removeTest = function(test) {
  var m = multicache.getCache("local");
  var testKey = "foo";
  var testVal = "bar";
  var removeCallback = function(e,r) {
    if (e) test.fail(e.message);
    test.done();
  };
  var setCallback = function (e,r) {
    if (e) test.fail(e.message);
    m.remove(testKey, removeCallback);
  };
  m.set(testKey, testVal, setCallback);
};

/**
 * removeTest
 *
 * simulate removing an item from the cache
 * with buffering
 */
var removeWithBufferTest = function(test) {
  var m = multicache.getCache("local", {buffer: true});
  var testKey = "foo";
  var testVal = "bar";
  var removeCallback = function(e,r) {
    if (e) test.fail(e.message);
    test.done();
  };
  var setCallback = function (e,r) {
    if (e) test.fail(e.message);
    m.remove(testKey, removeCallback);
  };
  m.set(testKey, testVal, setCallback);
};

/**
 * bufferGetUnderLimitTest
 *
 * simulates buffered get where value is only updated one time
 * @param test
 */
var bufferGetUnderLimitTest = function(test) {
  var getItemCalls = 2;
  var num = 2;
  test.expect(num);

  var m = multicache.getCache("local", {buffer: true});

  m.storage.getItem = function(k,o,c) { // should only get invoked once
    if (!--getItemCalls) {
      test.fail();
      test.done();
    } else {
      c(null, "bar");
    }
  };

  var getCallback = function(e,r) {
    test.equal(r, "bar");
    if (!--num) {
      test.done();
    } else {
       m.get("foo", getCallback);
    }
  };

  var setCallback = function(e,r) {
    if (e) {
      test.fail();
    } else {
      m.get("foo", getCallback);
    }
  };
  m.set("foo", "bar", setCallback);
};

/**
 * bufferGetOverLimitTest
 *
 * simulates going over buffer refresh limit
 * so that values in local storage are updated
 * @param test
 */
var bufferGetOverLimitTest = function(test) {
  var getItemCalls = 3;
  var getCallbackCalls = 3;
  test.expect(3);

  var c = multicache.getCache("local", {buffer: true, refreshRate: 1});

  c.storage.getItem = function(k,o,c) {
    c(null, "bar");
    if (--getItemCalls < 0) {
      test.fail("storage should only have been accessed 1 time"); // storage accessed more than expected
    }
  };

  var getCallback = function() {
    test.ok(1, getCallbackCalls+" calls remained");
    if (!--getCallbackCalls) {
      test.done();
    }
  };

  var setCallback = function() {
    c.get("foo", getCallback);
    c.get("foo", getCallback);
    c.get("foo", getCallback);
  };
  c.set("foo", "bar", setCallback);
};

/**
 * setStorageTest
 *
 * update storage
 * @param test
 */
var setStorageTest = function(test) {
  test.expect(2);
  var mc = multicache.getCache("local");
  var willThrow = function() {
    mc.setStorage("foobar");
  };
  test.throws(willThrow, multicache.errors.InvalidParametersError);

  // now normal
  mc.setStorage(multicache.storage.Redis());
  test.ok(mc.storage instanceof multicache.storage.Redis);
  test.done();
};


// export module
module.exports = {
  getCacheTest: getCacheTest,
  setTest: setTest,
  getTest: getTest,
  removeTest: removeTest,
  removeWithBufferTest: removeWithBufferTest,
  connectRemoteTest: connectRemoteTest,
  connectLocalTest: connectLocalTest,
  disconnectLocalTest: disconnectLocalTest,
  disconnectRemoteTest: disconnectRemoteTest,
  bufferGetUnderLimitTest: bufferGetUnderLimitTest,
  bufferGetOverLimitTest: bufferGetOverLimitTest,
  setStorageTest: setStorageTest
};