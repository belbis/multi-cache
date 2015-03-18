/**
 * unit tests for storage.Storage
 */

var storage = require(__dirname + "/../../").storage;
var errors = require(__dirname + "/../../").errors;

/**
 * constructorTest
 *
 * assert interface
 * @param test
 */
var interfaceTest = function(test) {
  test.expect(13);

  var s = new storage.Storage();
  test.equal(typeof s.length, "number");
  test.equal(typeof s.key, "function");
  test.equal(typeof s.keySync, "function");
  test.equal(typeof s.getItem, "function");
  test.equal(typeof s.getItemSync, "function");
  test.equal(typeof s.setItem, "function");
  test.equal(typeof s.setItemSync, "function");
  test.equal(typeof s.removeItem, "function");
  test.equal(typeof s.removeItemSync, "function");
  test.equal(typeof s.expire,  "function");
  test.equal(typeof s.expireSync, "function");
  test.equal(typeof s.clear, "function");
  test.equal(typeof s.clearSync, "function");
  test.done();
};

// export module
module.exports = {
  interfaceTest: interfaceTest
};