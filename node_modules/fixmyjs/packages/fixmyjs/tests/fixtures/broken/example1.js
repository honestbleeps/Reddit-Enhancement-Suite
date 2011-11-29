var foo = function () {
  // missing semicolon
  dowhatnow()
  var test = null;

  // missing semicolon
  // already defined test
  var test = 12

// missing semicolon
}

// missing space
foo.bar = function() {
  // missing space + semicolon
  return 2+2 - 1*4
};

function id() {
  var bar = 9;

  if (200 > bar) {
  // bad indentation
      bar = 14;
  } else {
  // bad indentation + Mixed spaces & tabs
  	 	 	    bar = 12;

  }

	if (true) {
		// redeclaration
		var bar = 1;
	// unnecessary semicolon (with tabs!)
	};

  return bar;

// unnecessary semicolon
};

// can be expressed in dot notation
foo["bar"]();
