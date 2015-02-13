/**
 * unit tests for errors
 */

// errors
var errors = require(__dirname + "/../");

var invalidParametersErrorTest = function(test) {
  test.expect(1);
  test.throws(function() {
    throw new errors.InvalidParametersError;
  }, errors.InvalidParametersError);
  test.done();
};

var notImplementedErrorTest = function(test) {
  test.expect(1);
  test.throws(function() {
    throw new errors.NotImplementedError;
  }, errors.NotImplementedError);
  test.done();
};

var CacheErrorTest = function(test) {
  test.expect(1);
  test.throws(function() {
    throw new errors.CacheError;
  });
  test.done();
};

var CacheConnectErrorTest = function(test) {
  test.expect(1);
  test.throws(function() {
    throw new errors.CacheConnectError;
  });
  test.done();
};

module.exports = {
  invalidParametersErrorTest: invalidParametersErrorTest,
  notImplementedErrorTest: notImplementedErrorTest
};