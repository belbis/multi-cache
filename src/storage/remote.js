
// standard imports
var util = require("util");

// local imports
var Storage = require(__dirname + "/storage").Storage;
var errors = require(__dirname + "/../errors");

/**
 * Remote
 *
 * Remote extends the Storage interface
 * to allow for a remote source
 * @extends {Storage}
 * @param options
 * @returns {Remote}
 * @constructor
 */
function Remote(options) {}
util.inherits(Remote, Storage);

/**
 * connect
 *
 * connect the Remote to remote data source
 * @param options {object} options
 * @param callback {function} next step
 */
Remote.prototype.connect = function(options, callback) {};

/**
 * disconnect
 *
 * disconnect the storage from remote source
 * @param callback {function} next step
 */
Remote.prototype.disconnect = function(callback) {};

// export module
module.exports = {
  Remote: Remote
};