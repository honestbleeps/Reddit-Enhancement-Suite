var fs = require('fs');
var jsonic = require('jsonic');

function findBraces(str, matchPos) {
  var matchPosStart = null;
  var matchPosEnd = null;
  var openBraceCount = 0;
  for (var i = matchPos; i < str.length; i++){
    if (str[i] == '{') {
      matchPosStart = i;
      matchPos = ++i;
      openBraceCount++;
      break;
    }
  }

  for (var i = matchPos; i < str.length; i++){
    if (str[i] == '{') {
      openBraceCount++;
    }
    if (str[i] == '}') {
      openBraceCount--;
      if (openBraceCount == 0) { //We did it!
        matchPosEnd = matchPos = i;
        break;
      }
    }
  }
  return [matchPosStart, matchPosEnd];
}

function changeTicksAndEscapeNewLines( str ) {
  str = str.replace(/'/g, "\'");
  return str.replace(/`([^`]*)`/g, function(match, capture1) {
    return '\'' + capture1.replace(/\r?\n/g, '\\n') + '\'';
  } );
}

function parseModule(str, matchPos) {
  var braceLocations = findBraces(str, matchPos);
  // debugger;
  var jsonText = str.slice(braceLocations[0], braceLocations[1] + 1);
  var jsonTextClean = changeTicksAndEscapeNewLines(jsonText);
  return eval("a = " + jsonTextClean); //Must be assigned to a variable for eval to return an object. JS!
}


var moduleOptionsStr = fs.readFileSync(process.argv[2], {encoding: 'utf8'}); //encoding specified or else wont return string
console.log(moduleOptionsStr.slice(0,100) + '...');
var moduleOptionsLocation = moduleOptionsStr.match(/module\.options/).index + 'module.options'.length;
var moduleOptionsObject = parseModule(moduleOptionsStr, moduleOptionsLocation);
var path = process.argv[2].split(/[\/\\]/);
var moduleID = path[path.length - 1].split(/\./)[0];

var langStr = fs.readFileSync(process.argv[3], {encoding: 'utf8'});
var langObject = parseModule(langStr, 0);


function titleCase(str) {
  // adapted from http://stackoverflow.com/a/31865052/1136754
  str = str.split(/(?=[A-Z])/).join(" ");
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function capitalize(str) {
  return str.slice(0,1).toUpperCase() + str.slice(1);
}

function i18nify(obj, parentName){
  parentName = parentName || '';
  var hasTitle = false;
  for (key in obj){
    if (typeof obj[key] == "object") {
      i18nify(obj[key], capitalize(parentName) + capitalize(key));
    } else {
      switch (key) {
        case "title":
        hasTitle = true;
        case "description":
        var i18nifier = moduleID + "Options" + capitalize(parentName) + capitalize(key);
        langObject[i18nifier] = {"message": obj[key]};
        obj[key] = i18nifier;
      }
      if (!hasTitle) {
        obj["title"] = titleCase(key);
      }
    }
  }
}

i18nify(moduleOptionsObject);

function serializeEverything() {
  fs.writeFile('./lang.js', JSON.stringify(langObject), (err) =>
  {
    if (err) throw err;
    console.log("./lang.js saved, please review for correctness!")
  });
  var braceLocs = findBraces(moduleOptionsStr, moduleOptionsLocation);
  var outputModule = moduleOptionsStr.slice(0, braceLocs[0]) +
  JSON.stringify(moduleOptionsObject) +
  moduleOptionsStr.slice(braceLocs[1]);

  fs.writeFile('./'+ moduleID +'.js', outputModule, (err) =>
  {
    if (err) throw err;
    console.log('./'+ moduleID +'.js saved, please review for correctness!')
  });
}

serializeEverything();
