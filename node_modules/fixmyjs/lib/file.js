var fs = require('fs');
var diff = require('diff');
var fixmyjs = require('../packages/fixmyjs/fixmyjs');

var File = function (fileName) {
  this.fileName = fileName;
};

File.prototype.read = function () {
  this.contents = fs.readFileSync(this.fileName, 'utf8');
};

File.prototype.write = function () {
  if (this.modified) {
    fs.writeFileSync(this.fileName, this.modified, 'utf8');
  }
};

File.prototype.fix = function (data) {
  if (!this.contents) {
    this.read();
  }
  this.modified = fixmyjs(data, this.contents).run();
};

File.prototype.diff = function () {
  if (this.contents && this.modified) {
    var df = diff.diffLines(this.contents, this.modified);
    Object.keys(df).forEach(function (n) {
      var str = "";
      var line = df[n];
      if (line.removed) {
        str = "\033[31m" + line.value + "\033[39m";
      } else if (line.added) {
        str = "\033[32m" + line.value + "\033[39m";
      } else {
        str = "\033[90m" + line.value + "\033[39m";
      }
      process.stdout.write(str);
    });
  }
};

File.prototype.patch = function () {
  if (this.contents && this.modified) {
    var df = diff.createPatch(this.fileName, this.contents, this.modified, "", "");
    process.stdout.write(df);
  }
};

module.exports = File;
