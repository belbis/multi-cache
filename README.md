

# multi-cache 

flexible cache interface with multiple backends as options

[![NPM Version](https://nodei.co/npm/multi-cache.png?downloads=true)](https://npmjs.org/package/multi-cache)
[![Build Status](https://secure.travis-ci.org/belbis/multi-cache.png?branch=master)](http://travis-ci.org/belbis/multi-cache)
[![Coverage Status](https://coveralls.io/repos/belbis/multi-cache/badge.svg)](https://coveralls.io/r/belbis/multi-cache)
[![Dependency Status](https://gemnasium.com/belbis/multi-cache.svg)](https://gemnasium.com/belbis/multi-cache)

## Installing

To install the latest release with npm run

```npm install multi-cache```

to install the development version from github run:

```npm install "git+https://github.com/belbis/multi-cache"```

## Introduction

The goal of this project is to provide a high level interface to an interchangeable number of 
caches

## usage

simple memcached example:

```javascript
var mc = require("multi-cache").getCache("memcached");

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
```

see more examples in the [examples](examples/) folder


## tests

testing utilizes multi-cache-mocks, which is a project that can be found here
https:/github.com/belbis/multi-cache-mocks

run with ```bash
npm test```


## future

extend storage options
