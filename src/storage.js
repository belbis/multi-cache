
// standard imports
var fs = require("fs");

var storage = {lower: {}};
var storageDir = __dirname + "/storage";

// load storage
var files = fs.readdirSync(storageDir).forEach(function(file) {
  var storagePath = storageDir + "/" + file;
  var mod = require(storagePath);
  var key = Object.keys(mod)[0];
  storage[key] = mod[key];
  storage.lower[key.toLowerCase()] = mod[key];
});

// module export
module.exports = storage;