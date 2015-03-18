/**
 * unit tests for DynamoDBCache
 */

// local imports
var errors = require(__dirname + "/../../").errors;
var storage = require(__dirname + "/../../").storage;

/**
 * constructorTest
 *
 * tests the constructor
 * @param test
 */
var constructorTest = function(test) {
  test.expect(6);

  var c = storage.Local();
  test.ok(c instanceof storage.Local);
  test.ok(c instanceof storage.Storage);
  var c2 = new storage.Local();
  test.ok(c2 instanceof storage.Local);
  test.ok(c2 instanceof storage.Storage);

  test.equal(c.length, 0);
  test.equal(c2.length, 0);

  test.done();
};

/**
 * setItemTest
 *
 * tests the set method
 * @param test
 */
var setItemTest = function(test) {
  var num = 4;
  test.expect(num);

  var lc = storage.Local();
  var setCallback = function(e,r) {
    test.equal(e, null);
    if (lc.length === num) { // also checks length
      test.done();
    }
  };
  // str
  lc.setItem('key', 'value', setCallback);

  // num
  lc.setItem('key2', 1, setCallback);

  // arr
  lc.setItem('key3', ['foo', 'bar', ['baz']], setCallback);

  // obj
  lc.setItem('key4', {key: 'value'}, setCallback);
};

var setItemSyncTest = function(test) {
  test.expect(5);

  var lc = storage.Local();
  // str
  test.ok(lc.setItemSync('key', 'value'));

  // num
  test.ok(lc.setItemSync('key2', 1));

  // arr
  test.ok(lc.setItemSync('key3', ['foo', 'bar', ['baz']]));

  // obj
  test.ok(lc.setItemSync('key4', {key: 'value'}));

  test.equal(lc.length, 4);

  test.done();
};

/**
 * getItemTest
 *
 * tests the get method
 * @param test
 */
var getItemTest = function(test) {
  test.expect(1);
  
  var lc = new storage.Local();

  var getCallback = function(e,r) {
    test.equal(r, "value");
    test.done();
  };

  var setCallback = function(e,r) {
    lc.getItem("key", getCallback)
  };
  lc.setItem("key", "value", setCallback);
};

/**
 * getItemSyncTest
 *
 * simulate key fetch sync
 * @param test
 */
var getItemSyncTest = function(test) {
  test.expect(2);
  var lc = new storage.Local();
  test.ok(lc.setItemSync("key", "value"));
  test.equal(lc.getItemSync("key"), "value");
  test.done();
};

/**
 * removeItemTest
 *
 * simulate removing a key
 * @param test
 */
var removeItemTest = function(test) {
  test.expect(5);
  var lc = new storage.Local();
  test.ok(lc.setItemSync("key", "value"));
  test.equal(lc.length, 1);
  lc.removeItem("key", function(e,r) {
    test.equal(e, null);
    test.equal(r, 0);
    test.equal(lc.length, 0);
    test.done();
  });
};

/**
 * removeItemSyncTest
 *
 * simulate removing a key synchronously
 * @param test
 */
var removeItemSyncTest = function(test) {
  test.expect(4);
  var lc = new storage.Local();
  test.ok(lc.setItemSync("key", "value"));
  test.equal(lc.length, 1);
  test.equal(lc.removeItemSync("key"), 0);
  test.equal(lc.length, 0);
  test.done();
};

/**
 * expireTest
 *
 * simulate expiration
 * @param test
 */
var expireTest = function(test) {
  test.expect(2);
  var lc = new storage.Local();
  var expiry = 1;
  var getExpiredItemCallback = function(e,r) {
    test.ok(e instanceof errors.CacheMissError);
    test.done();
  };
  var expireCallback = function() {
    setTimeout(function() {
      lc.getItem("foo", getExpiredItemCallback);
    }, expiry+1); // just be greater than expiry
  };
  test.ok(lc.setItemSync("foo", "bar"));
  lc.expire("foo", expiry, expireCallback);
};

/**
 *
 * @param test
 */
var expireSyncTest = function(test) {
  test.expect(2);
  var lc = new storage.Local();
  var expiry = 1;
  test.ok(lc.setItemSync("foo", "bar"));
  var willThrow = function() {
    lc.getItemSync("foo");
  };
  lc.expireSync("foo", expiry);
  test.throws(willThrow, errors.CacheMissError);
  test.done();
};

/**
 * emptyGetItemTest
 *
 * simulate cache miss
 * @param test
 */
var emptyGetItemTest = function(test) {
  test.expect(2);

  var lc = storage.Local();
  var willThrow = function() {
    lc.getItemSync("key");
  };
  test.throws(willThrow, errors.CacheMissError);

  var missGetCallback = function(e,r) {
    test.ok(e instanceof errors.CacheMissError);
    test.done();
  };
  lc.getItem("key", missGetCallback);
};

/**
 * clearTest
 *
 * simulate clear call
 * @param test
 */
var clearTest = function(test) {
  test.expect(2);
  var lc = new storage.Local();
  var callback = function(e,r) {
    test.equal(lc.length, 0);
    test.deepEqual(lc.remote, {});
    test.done();
  };
  lc.clear(callback);
};

/**
 * clearSyncTest
 *
 * simulate clearSync call
 * @param test
 */
var clearSyncTest = function(test) {
  test.expect(2);
  var lc = new storage.Local();
  lc.clearSync();
  test.equal(lc.length, 0);
  test.deepEqual(lc.remote, {});
  test.done();
};

/**
 * keyTest
 *
 * simulates key call
 * @param test
 */
var keyTest = function(test) {
  var num = 2;
  test.expect(num*2);
  var lc = new storage.Local();
  lc.setItemSync("foo", "bar");
  var keyCallback = function(e,r) {
    test.equal(e, null);
    test.equal(r, "foo");
    if (--num===0) test.done();
  };
  var badKeyCallback = function(e,r) {
    test.equal(e, null);
    test.equal(r, null);
    if (--num===0) test.done();
  };
  lc.key(0, keyCallback);
  lc.key(3, badKeyCallback);
};

/**
 * keySyncTest
 *
 * simulates key call
 * @param test
 */
var keySyncTest = function(test) {
  test.expect(2);
  var lc = new storage.Local();
  lc.setItemSync("foo", "bar");
  test.equal(lc.keySync(0), "foo");
  test.equal(lc.keySync(2), null);
  test.done();
};

// export module
module.exports = {
  constructorTest: constructorTest,
  getItemTest: getItemTest,
  getItemSyncTest: getItemSyncTest,
  setItemTest: setItemTest,
  setItemSyncTest: setItemSyncTest,
  removeItemTest: removeItemTest,
  removeItemSyncTest: removeItemSyncTest,
  expireTest: expireTest,
  expireSyncTest: expireSyncTest,
  emptyGetItemTest: emptyGetItemTest,
  clearTest: clearTest,
  clearSyncTest: clearSyncTest,
  keyTest: keyTest,
  keySyncTest: keySyncTest
};