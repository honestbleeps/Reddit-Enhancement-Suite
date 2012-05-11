var jshint = require("./lib/jshint").JSHINT;
var src = require("fs").readFileSync(process.argv[2], "utf8");

var config = {
	browser: true,
	devel: true,
	asi: true, //ignore missing semicolons
	eqnull: true,
	trailing: true,
	multistr: true,
	undef: true,
	smarttabs: true,
	jquery: true,
	maxerr: 100
};

var colors = {
	red: '\u001b[31m',
	green: '\u001b[32m',
	yellow: '\u001b[33m',
	cyan: '\u001b[36m',
	reset: '\u001b[0m'
};

//Execute JSHint
if( jshint(src, config) )
{
	console.log(colors.green + "JSHint check passed." + colors.reset);
}
else
{
	console.log(colors.red + "JSHint found errors." + colors.reset);

	var errorCount = 0;
	jshint.errors.forEach(function(e) {
		if( !e )
			return;

		var str = e.evidence ? e.evidence : "";
		var character = e.character === true ? "EOL" : "Col " + e.character;

		if( str )
		{
			str = str.replace(/\t/g, " ").trim();
			console.log(colors.cyan + "[Line " + e.line + ", " + character + "] " + colors.reset + e.reason);
			console.log("    " + str + "\n");
			errorCount++;
		}
	});
	
	if( errorCount >= config.maxerr )
		console.log(colors.red + "Found " + errorCount + " errors. Stopped due to reaching maxerr.\n" + colors.reset);
	else
		console.log(colors.yellow + "Found " + errorCount + " errors.\n" + colors.reset);
}