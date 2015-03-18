/**
 * unit tests for errors
 */

// errors
var errors = require(__dirname + "/../../").errors;

/**
 * invalidParametersErrorTest
 *
 * simulate throwing an error when parameters
 * are invalid
 * @param test
 */
var invalidParametersErrorTest = function(test) {
  test.expect(1);
  test.throws(function() {
    throw new errors.InvalidParametersError;
  }, errors.InvalidParametersError);
  test.done();
};

/**
 * notImplementedErrorTest
 *
 * simulate throwing an error when feature
 * is unimplemented
 * @param test
 */
var notImplementedErrorTest = function(test) {
  test.expect(1);
  test.throws(function() {
    throw new errors.NotImplementedError;
  }, errors.NotImplementedError);
  test.done();
};

/**
 * cacheErrorTest
 *
 * simulate throwing a general cache error
 * @param test
 */
var cacheErrorTest = function(test) {
  test.expect(1);
  var willThrow = function() {
    throw new errors.CacheError;
  };
  test.throws(willThrow, errors.CacheError);
  test.done();
};

/**
 * cacheConnectErrorTest
 *
 * simulate throwing connection error
 * @param test
 */
var cacheConnectErrorTest = function(test) {
  test.expect(1);
  var willThrow = function() {
    throw new errors.CacheConnectError;
  };
  test.throws(willThrow, errors.CacheConnectError);
  test.done();
};

module.exports = {
  invalidParametersErrorTest: invalidParametersErrorTest,
  notImplementedErrorTest: notImplementedErrorTest,
  cacheErrorTest: cacheErrorTest,
  cacheConnectErrorTest: cacheConnectErrorTest
};