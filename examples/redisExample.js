// Redis MultiCache Example
// requires redis instance running on localhost:6379
var rc = require("../").getCache("redis");

var getCallback = function(e,r) {
  if (e) throw e;
  console.log(r);
};
var setCallback = function() {
  rc.get("foo", getCallback);
};
var connectCallback = function() {
  rc.set("foo", "bar", setCallback);
};
rc.connect(connectCallback);
