/**
 * unit tests for DynamoDB
 */

// local imports
var storage = require(__dirname + "/../../").storage;
var errors = require(__dirname + "/../../").errors;

/**
 * stub for remote operations
 * @type {{cache: Local, putItem: putItem, getItem: getItem}}
 */
var DynamoDBStub = {
  cache: new storage.Local(),
  hashKey: "id",
  putItem: function(params, callback) {
    //var k = params[this.hashKey];
    //delete params[this.hashKey];
    var k = params.Item[this.hashKey].S;
    this.cache.setItem(k, params, callback);
  },
  getItem: function(params, callback) {
    this.cache.getItem(params.Key[this.hashKey].S, callback);
  },
  clear: function() {
    this.cache = new storage.Local();
    return this;
  }
};

/**
 * constructorTest
 *
 * tests the constructor
 * @param test
 */
var constructorTest = function(test) {
  test.expect(10);

  // bad options
  //var willThrow = function() {
  //  var noOptions = storage.DynamoDB();
  //};
  //test.throws(willThrow, errors.InvalidParametersError);

  // instanceof
  var c = new storage.DynamoDB({});
  test.ok(c instanceof storage.DynamoDB);
  test.ok(c instanceof storage.Storage);

  var c2 = storage.DynamoDB({
    metaKey: "foo",
    hashKey: "bar",
    table: "baz"
  });
  test.ok(c2 instanceof storage.DynamoDB);
  test.ok(c2 instanceof storage.Storage);

  // defaults
  test.equal(c.metaKey, "_meta");
  test.equal(c.hashKey, "id");
  test.equal(c.table, "table");

  // params
  test.equal(c2.metaKey, "foo");
  test.equal(c2.hashKey, "bar");
  test.equal(c2.table, "baz");

  test.done();
};

/**
 * connectTest
 *
 * tests the connect method
 * @param test
 */
var connectTest = function(test) {
  var num = 2;
  test.expect(num*2);

  var dc = new storage.DynamoDB({});

  var options = {
    region: "foo",
    accessKeyId: "bar",
    secretAccessKey: "baz"
  };
  var dc2 = new storage.DynamoDB();
  var connectCallback = function(e,r) {
    test.equal(e, null);
    test.equal(r, true);
    if(--num===0) test.done();
  };

  var badConnectCallback = function(e,r) {
    test.ok(r == undefined);
    test.ok(e instanceof errors.InvalidParametersError);
    if (--num===0) test.done();
  };
  dc.connect(null, badConnectCallback);
  dc2.connect(options, connectCallback);
};

/**
 * disconnectTest
 *
 * simulates disconnecting from remote dynamodb
 * @param test
 */
var disconnectTest = function(test) {
  var dc = new storage.DynamoDB({});
  var disconnectCallback = function(e,r) {
    test.equal(e, null);
    test.equal(dc.remote, null);
    test.done();
  };
  dc.disconnect(disconnectCallback);
};

/**
 * setItemTest
 *
 * simulate storing a value at key
 * @param test
 */
var setItemTest = function(test) {
  test.expect(1);

  var dc = new storage.DynamoDB({});
  dc.remote = DynamoDBStub.clear();

  var setCallback = function(e,r) {
    test.equal(e, null);
    test.done();
  };
  dc.setItem("key", {foo: "bar"}, setCallback);
};

/**
 * getItemTest
 *
 * tests the get method
 * @param test
 */
var getItemTest = function(test) {
  test.expect(3);
  var dc = new storage.DynamoDB({});
  dc.remote = DynamoDBStub.clear();
  var getCallback = function(e,r) {
    test.equal(e,null);
    test.deepEqual(r, {"foo": "bar"});
    test.done();
  };
  var setCallback = function(e,r) {
    test.equal(e, null);
    dc.getItem("key", getCallback);
  };
  dc.setItem("key", {"foo": "bar"}, setCallback);
};

/**
 *
 * @param test
 */
var emptyGetItemTest = function(test) {
  test.expect(2);

  var dc = new storage.DynamoDB({});
  dc.remote = DynamoDBStub.clear();
  var willThrow = function() {
    dc.getItemSync("key");
  };
  test.throws(willThrow, Error);
  var errGetCallback = function(e, r) {
    test.ok(e instanceof errors.CacheError); // NOTE: stub uses Local, so handler will assign this as error
    test.done();
  };
  dc.getItem("key", errGetCallback);
};

/**
 * removeItemTest
 *
 * simulate removing an item
 * @param test
 */
var removeItemTest = function(test) {
  // todo: implement me
  test.done();
};

/**
 * expireTest
 *
 * simulate expiration
 * @param test
 */
var expireTest = function(test) {
  test.expect(1);
  var dc = new storage.DynamoDB();
  dc.remote = DynamoDBStub.clear();

  var getItemCallback = function(e,r) {
    test.ok(e instanceof errors.CacheMissError);
    test.done();
  };

  var expireCallback = function() {
    setTimeout(function() {
      dc.getItem("foo", getItemCallback);
    },2);
  };
  var setItemCallback = function(e,r) {
    if (e) test.fail("an unexpected error occurred in setItem");
    dc.expire("foo", 1, expireCallback);
  };
  dc.setItem("foo", "bar", setItemCallback);
};

/**
 * expireInvalidParametersTest
 * @param test
 */
var expireInvalidParametersTest = function(test) {
  test.expect(1);
  var dc = new storage.DynamoDB();
  dc.remote = DynamoDBStub.clear();
  var expireCallback = function(e,r) {
    test.ok(e instanceof errors.InvalidParametersError);
    test.done();
  };
  dc.expire("foo", "bar", expireCallback);
};

/**
 * notImplementedTest
 *
 * shows unimplemented features
 * @param test
 */
var notImplementedTest = function(test) {
  var num = 3;
  test.expect(num);
  var dc = new storage.DynamoDB();
  var callback =function(e,r) {
    if (e instanceof errors.NotImplementedError) test.ok(1);
    if (--num===0) test.done();
  };
  dc.clear(callback);
  dc.key(1,callback);
  dc.removeItem("foo", callback);
};

/**
 * notImplementedTest
 *
 * shows unimplemented sync features
 * @param test
 */
var notImplementedSyncTest = function(test) {
  test.expect(6);
  var dc = new storage.DynamoDB();
  var willThrow1 = function() {
    dc.setItemSync("foo", "bar");
  };
  var willThrow2 = function() {
    dc.getItemSync("foo");
  };
  var willThrow3 = function() {
    dc.removeItemSync("foo");
  };
  var willThrow4 = function() {
    dc.expireSync("foo");
  };
  var willThrow5 = function() {
    dc.clearSync();
  };
  var willThrow6 = function() {
    dc.keySync(1);
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
  disconnectTest: disconnectTest,
  setItemTest: setItemTest,
  getItemTest: getItemTest,
  emptyGetItemTest: emptyGetItemTest,
  removeItemTest: removeItemTest,
  expireTest: expireTest,
  expireInvalidParametersTest: expireInvalidParametersTest,
  notImplementedTest: notImplementedTest,
  notImplementedSyncTest: notImplementedSyncTest
};