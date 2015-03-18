// switch storage MultiCache Example
// note: this requires a memcached instance to be running on localhost:11211
// this example starts off using a local cache,
// then switches backends to memcached and performs set/get
var multicache = require("../");

var c = multicache.getCache("local");
var switchTime = function() {
  c.setStorage(multicache.storage.Memcached({serverLocations: "localhost:11211"}));
  c.connect(connectCallback);
};
ctr = 1;
var getCallback = function(e,r) {
  if (e) throw e;
  console.log(r);
  if (ctr--) switchTime();
};
var setCallback = function() {
  c.get("foo", getCallback);
};
var connectCallback = function() {
  c.set("foo", ctr, setCallback);
};
c.connect(connectCallback);
