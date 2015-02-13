/**
 * unit tests for Cache
 */

var Cache = require(__dirname + "/../").Cache;
var errors = require(__dirname + "/../").errors;

/**
 * testConstructor
 *
 * tests the constructor
 * @param test
 */
var testConstructor = function(test) {
  test.expect(2);

  var c = new Cache();
  test.ok(c instanceof Cache);

  var c2 = Cache();
  test.ok(c2 instanceof Cache);

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

  var c = new Cache();
  var willThrow = function() {
    c.connect();
  };
  test.throws(willThrow, errors.NotImplementedError);

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

  var c = new Cache();
  var willThrow = function() {
    c.set('key', 'value');
  };
  test.throws(willThrow, errors.NotImplementedError);

  test.done();
};

/**
 * testGet
 *
 * tests the get method
 * @param test
 */
var testGet = function(test) {
  test.expect(1);

  var c = new Cache();
  var willThrow = function() {
    c.get('key');
  };
  test.throws(willThrow, errors.NotImplementedError);

  test.done();
};

module.exports = {
  testConstructor: testConstructor,
  testGet: testGet,
  testSet: testSet
};