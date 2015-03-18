// memcached MultiCache example
// requires memcached instance running on localhost:11211
var mc = require("../").getCache("memcached");

var getCallback = function(e,r) {
  if (e) throw e;
  console.log(r);
  mc.disconnect();
};
var setCallback = function(e,r) {
  if (e) throw e;
  mc.get("foo", getCallback);
};
var connectCallback = function() {
  mc.set("foo", "bar", setCallback);
};
mc.connect(connectCallback);