var fs = require('fs');
var path = require('path');
var commander = require('commander');
var minimatch = require('minimatch');
var EventEmitter = require('events').EventEmitter;
var jshint = require('../packages/jshint/jshint');
var _cache = {
  directories: {}
};
var File = require('./file');

function _removeJsComments(str) {
  str = str || '';
  str = str.replace(/\/\*[\s\S]*(?:\*\/)/g, ''); //everything between "/* */"
  str = str.replace(/\/\/[^\n\r]*/g, ''); //everything after "//"
  return str;
}

function _loadAndParseConfig(filePath) {
  var config = {},
    fileContent;

  try {
    if (path.existsSync(filePath)) {
      fileContent = fs.readFileSync(filePath, "utf-8");
      config = JSON.parse(_removeJsComments(fileContent));
    }
  } catch (e) {
    process.stdout.write("Error opening config file " + filePath + '\n');
    process.stdout.write(e + "\n");
    process.exit(1);
  }

  return config;
}

function _mergeConfigs(homerc, cwdrc) {
  var homeConfig = _loadAndParseConfig(homerc),
    cwdConfig = _loadAndParseConfig(cwdrc),
    prop;

  for (prop in cwdConfig) {
    if (typeof prop === 'string') {
      if (prop === 'predef') {
        homeConfig.predef = (homeConfig.predef || []).concat(cwdConfig.predef);
      } else {
        homeConfig[prop] = cwdConfig[prop];
      }
    }
  }

  return homeConfig;
}

function doLint(buffer, file, results, config, data) {
  var lintdata;

  config.maxerr = 500;
  if (!jshint.JSHINT(buffer, config)) {
    jshint.JSHINT.errors.forEach(function (error) {
      if (error) {
        results.push({file: file, error: error});
      }
    });
  }

  lintdata = jshint.JSHINT.data();

  if (lintdata) {
    lintdata.file = file;
    data.push(lintdata);
  }
}

function _lint(file, results, config, data) {
  var buffer;

  try {
    buffer = fs.readFileSync(file, 'utf-8');
  } catch (e) {
    process.stdout.write("Error: Cant open: " + file);
    process.stdout.write(e + '\n');
  }

  // Remove potential Unicode Byte Order Mark.
  buffer = buffer.replace(/^\uFEFF/, '');

  doLint(buffer, file, results, config, data);
}

function isDirectory(aPath) {
  var isDir;

  try {
    if (_cache.directories.hasOwnProperty(aPath)) {
      isDir = _cache.directories[aPath];
    } else {
      isDir = fs.statSync(aPath).isDirectory();
      _cache.directories[aPath] = isDir;
    }
  } catch (e) {
    isDir = false;
  }

  return isDir;
}


function _shouldIgnore(somePath, ignore) {
  function isIgnored(p) {
    var fnmatch = minimatch(somePath, p, { nocase: true });
    var lsmatch = isDirectory(p) && p.match(/^[^\/]*\/?$/) && somePath.match(new RegExp("^" + p + ".*"));

    return !!(fnmatch || lsmatch);
  }

  return ignore.some(function (ignorePath) {
    return isIgnored(ignorePath);
  });
}

function _collect(filePath, files, ignore) {
  if (ignore && _shouldIgnore(filePath, ignore)) {
    return;
  }

  if (fs.statSync(filePath).isDirectory()) {
    fs.readdirSync(filePath).forEach(function (item) {
      _collect(path.join(filePath, item), files, ignore);
    });
  } else if (filePath.match(/\.js$/)) {
    files.push(filePath);
  }
}

function JSHINT(targets, config, ignore, ev) {
  var files = [];
  var results = [];
  var data = [];

  targets.forEach(function (target) {
    _collect(target, files, ignore);
  });

  files.forEach(function (file) {
    _lint(file, results, config, data);
  });

  _cache = {
    directories: {}
  };

  data.forEach(function (result) {
    var file = new File(result.file);
    file.fix(result);
    ev.emit("fixed", file);
  });

  ev.emit("done");
}

function interpret(targets, ev) {
  var config, ignore;
  var pathsToIgnore = path.join(process.cwd(), '.jshintignore');
  var defaultConfig = path.join(process.env.HOME, '.jshintrc');
  var projectConfig = path.join(process.cwd(), '.jshintrc');

  if (commander.config) {
    config = _loadAndParseConfig(commander.config);
  } else {
    config = _mergeConfigs(defaultConfig, projectConfig);
  }

  if (path.existsSync(pathsToIgnore)) {
    ignore = fs.readFileSync(pathsToIgnore, "utf-8").split("\n").filter(function (line) {
      return !!line;
    });
  }

  JSHINT(targets, config, ignore, ev);
}

function fixmyjs(args) {
  var ev = new EventEmitter();

  commander
    .option('-c, --config [.jshintrc]', "Load your own config file")
    .option('-d, --diff', "Similar to dry-run")
    .option('-r, --dry-run', "Performs a dry-run and shows you a diff")
    .option('-p, --patch', "Output a patch file to stdout")
    .parse(args);

  ev.on('fixed', function (io) {
    if (commander.dryRun || commander.diff) {
      io.diff();
    } else if (commander.patch) {
      io.patch();
    } else {
      io.write();
    }
  });

  ev.on('done', function (io) {
    console.log("Done.");
  });

  if (commander.args.length === 0) {
    return commander.emit('help');
  } else {
    return interpret(commander.args, ev);
  }
}

module.exports = {
  run: fixmyjs,
  interpret: interpret
};
