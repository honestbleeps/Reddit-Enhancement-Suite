// trailing decimal
var a = 2.;

// leading decimal
var b = .3;

// trailing + leading
var aa = .3; var ab = 1.2; var ac = .5; var ad = 2.0; var ae = 0.;

// array literal instead
var c = new Array();


// obj literal instead
var d = new Object();

// unexpected spaces
function e ( )
{
  // bad line breaks
  return
  {
    "foo": "bar"
  };
}

// use isNaN function for comparing
if (a === NaN) {
  // do nothing
}

var h = (function i() {
  return "foo";

// need to move invocation inside the parens.
})();

// unnecessary intialization to undefined
var j = undefined;

// debugger not needed
debugger;
