var vows = require('vows');
var assert = require('assert');
var fixmyjs = require('../lib/');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

var tests = fs.readdirSync(__dirname + "/fixtures/broken/");

var specs = {};

tests.forEach(function (test) {
  var file_n = __dirname + "/fixtures/broken/" + test;
  var file_y = __dirname + "/fixtures/ok/" + test;

  var spec = {};
  spec["?"] = {
    topic: function () {
      var ev = new EventEmitter();
      ev.on("fixed", function (io) {
        this.callback(null, io.modified);
      }.bind(this));

      fixmyjs.interpret([file_n], ev);
    },

    "ok": function (topic) {
      var ok = fs.readFileSync(file_y).toString();
      assert.equal(topic, ok);
    }

  };

  specs[test] = spec;
});

vows.describe("fixmyjs").addBatch(specs).export(module);
