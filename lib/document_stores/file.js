var fs = require('fs');
var crypto = require('crypto');

var winston = require('winston');

// For storing in files
// options[type] = file
// options[path] - Where to store

var FileDocumentStore = function (options) {
  this.basePath = options.path || './data';
  this.expire = options.expire;
};

// Generate md5 of a string
FileDocumentStore.md5 = function (str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
};

// Save data in a file, key as md5 - since we don't know what we could
// be passed here
FileDocumentStore.prototype.set = function (key, data, callback) {
  try {
    var _this = this;
    let base = _this.basePath;
    if (key.includes("suspicious")) {
      base = base + "/suspicious";
    }

    fs.mkdir(base, '700', function () {
      var fn = base + '/' + FileDocumentStore.md5(key);
      fs.writeFile(fn, data, 'utf8', function (err) {
        if (err) {
          winston.error(err.message);
          callback(false);
        }
        else {
          callback(true);
        }
      });
    });
  } catch (err) {
    winston.error(err)
    callback(false);
  }
};

// Get data from a file from key
FileDocumentStore.prototype.get = function (key, callback) {
  var fn = this.basePath + '/' + FileDocumentStore.md5(key);
  fs.readFile(fn, 'utf8', function (err, data) {
    if (err) {
      callback(false);
    }
    else {
      callback(data);
    }
  });
};

module.exports = FileDocumentStore;
