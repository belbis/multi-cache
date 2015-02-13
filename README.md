

# multi-cache 

flexible cache interface with multiple backends as options

[![NPM Version](https://nodei.co/npm/multi-cache.png?downloads=true)](https://npmjs.org/package/multi-cache)
[![Build Status](https://secure.travis-ci.org/belbis/multi-cache.png?branch=master)](http://travis-ci.org/belbis/multi-cache)
[![Coverage Status](https://coveralls.io/repos/belbis/multi-cache/badge.svg)](https://coveralls.io/r/belbis/multi-cache)

## Installing

To install the latest release with npm run

```npm install multi-cache```

to install the development version from github run:

```npm install "git+https://github.com/belbis/multi-cache"```

## Introduction

The goal of this project is to provide a high level interface to an interchangeable number of 
caches

## usage

dynamodb example:
```javascript
var connectOptions = {
  region: "DYNAMODB_REGION",
  accessKeyId: "DYNAMODB_ACCESSKEYID",
  secretAccessKey: "DYNAMODB_SECRETACCESSKEY"
};

var cache = DynamoDBCache();

cache.connect(connectOptions);

cache.set('1', 3);

cache.get('1', function(e,r) {
  console.log(r);
});
```

redis example
```javascript

var connectOptions = {
  host: "REDIS_HOST",
  db: "REDIS_DB",
}
```

## disclaimer

this project is under heavy development at the moment.

## tests

testing utilizes multi-cache-mocks, which is a project that can be found here
https:/github.com/belbis/multi-cache-mocks

run with ```bash
npm test```


## future

implement options?
    useEmitters - use event emitters instead of callbacks
    usePromises - use promises instead of callbacks
    retries - number of retries an operation will be attempted
