// DynamoDB MultiCache example
// note: this example requires there to be a table
// called "table" created with hash key "id"
var dc = require("../").getCache("dynamodb");

// replace with your credentials:
var connectOptions = {
  region: "DYNAMODB_REGION",
  accessKeyId: "DYNAMODB_ACCESSKEYID",
  secretAccessKey: "DYNAMODB_SECRETACCESSKEY"
};

var getCallback = function(e,r) {
  if (e) throw e;
  console.log(r);
};
var setCallback = function(e,r) {
  if (e) throw e;
  dc.get("foo", getCallback);
};
var connectCallback = function() {
  dc.set("foo", {foo: "bar"}, setCallback);
};
dc.connect(connectOptions, connectCallback);