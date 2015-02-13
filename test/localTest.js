/**
 * unit tests for DynamoDBCache
 */

// local imports
var errors = require(__dirname + "/../").errors;
var LocalCache = require(__dirname + "/../").LocalCache;

/**
 * testConstructor
 *
 * tests the constructor
 * @param test
 */
var testConstructor = function(test) {
  test.expect(2);

  var c = LocalCache();
  test.ok(c instanceof LocalCache);
  var c2 = new LocalCache();
  test.ok(c2 instanceof LocalCache);

  test.done();
};

/**
 * testConnect
 *
 * tests the connect method
 * @param test
 */
var testConnect = function(test) {
  test.expect(2);

  var dc = LocalCache({});
  var connectCallback = function(e,r) {
    test.equal(e, null);
    test.ok(r);
    test.done();
  };
  dc.connect(null,connectCallback);
};

/**
 * testSet
 *
 * tests the set method
 * @param test
 */
var testSet = function(test) {
  var num = 4;
  test.expect(num);

  var lc = LocalCache();
  var setCallback = function(e,r) {
    test.equal(e, null);
    if (--num === 0) test.done();
  };
  // str
  lc.set('key', 'value', setCallback);

  // num
  lc.set('key2', 1, setCallback);

  // arr
  lc.set('key3', ['foo', 'bar', ['baz']], setCallback);

  // obj
  lc.set('key4', {key: 'value'}, setCallback);

};

/**
 * testGet
 *
 * tests the get method
 * @param test
 */
var testGet = function(test) {
  test.expect(1);
  
  var lc = new LocalCache();

  var getCallback = function(e,r) {
    test.equal(r, "value");
    test.done();
  };

  var setCallback = function(e,r) {
    lc.get("key", getCallback)
  };
  lc.set("key", "value", setCallback);
};

/**
 * tests empty cache get
 * @param test
 */
var testEmptyGet = function(test) {
  test.expect(1);

  var lc = LocalCache();
  var missGetCallback = function(e,r) {
    test.ok(e instanceof errors.CacheMissError);
    test.done();
  };
  lc.get("key", missGetCallback);

};

// export module
module.exports = {
  testConstructor: testConstructor,
  testConnect: testConnect,
  testGet: testGet,
  testEmptyGet: testEmptyGet,
  testSet: testSet
};