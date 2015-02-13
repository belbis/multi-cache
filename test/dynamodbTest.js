/**
 * unit tests for DynamoDBCache
 */

// local imports
var DynamoDBCache = require(__dirname + "/../").DynamoDBCache;
var LocalCache = require(__dirname + "/../").LocalCache;
var Cache = require(__dirname + "/../").Cache;
var errors = require(__dirname + "/../").errors;

/**
 * stub for remote operations
 * @type {{cache: LocalCache, putItem: putItem, getItem: getItem}}
 */
var DynamoDBStub = {
  cache: new LocalCache(),
  hashKey: "id",
  putItem: function(params, callback) {
    var k = params[this.hashKey];
    delete params[this.hashKey];
    this.cache.set(k, params, callback);
  },
  getItem: function(params, callback) {
    this.cache.get(params.Key.S, callback);
  },
  flush: function() {
    this.cache = new LocalCache();
    return this;
  }
};

/**
 * testConstructor
 *
 * tests the constructor
 * @param test
 */
var testConstructor = function(test) {
  test.expect(11);

  // bad options
  var willThrow = function() {
    var noOptions = DynamoDBCache();
  };
  test.throws(willThrow, errors.InvalidParametersError);

  // instanceof
  var c = new DynamoDBCache({});
  test.ok(c instanceof DynamoDBCache);
  test.ok(c instanceof Cache);

  var c2 = DynamoDBCache({
    metaKey: "foo",
    hashKey: "bar",
    table: "baz"
  });
  test.ok(c2 instanceof DynamoDBCache);
  test.ok(c2 instanceof Cache);

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
 * testConnect
 *
 * tests the connect method
 * @param test
 */
var testConnect = function(test) {
  test.expect(1);

  var dc = new DynamoDBCache({});
  var willThrow = function() {
    dc.connect();
  };
  test.throws(willThrow, errors.InvalidParametersError);

  test.done();
};

/**
 * testSet
 *
 * tests the set method
 * @param test
 */
var testSet = function(test) {
  test.expect(1);

  var dc = new DynamoDBCache({});
  dc.remote = DynamoDBStub.flush();

  var setCallback = function(e,r) {
    test.equal(e, null);
    test.done();
  };
  dc.set("key", {foo: "bar"}, setCallback);

};

var testEmptyGet = function(test) {
  test.expect(1);

  var dc = new DynamoDBCache({});
  dc.remote = DynamoDBStub.flush();
  var errGetCallback = function(e, r) {
    test.ok(e instanceof errors.CacheError); // NOTE: stub uses LocalCache, so handler will assign this as error
    test.done();
  };
  dc.get("key", errGetCallback);
};

/**
 * testGet
 *
 * tests the get method
 * @param test
 */
var testGet = function(test) {
  test.expect(2);

  var dc = new DynamoDBCache({});
  dc.remote= DynamoDBStub.flush();
  var getCallback = function(e,r) {
    test.equal(e,null);
    //test.deepEqual(r, {"foo": "bar"});
    test.done();
  };
  var setCallback = function(e,r) {
    test.equal(e, null);
    dc.get("key", getCallback);
  };
  dc.set("key", {"foo": "bar"}, setCallback);
};

module.exports = {
  testConstructor: testConstructor,
  testConnect: testConnect,
  testGet: testGet,
  testEmptyGet: testEmptyGet,
  testSet: testSet
};