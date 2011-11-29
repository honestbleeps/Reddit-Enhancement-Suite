var fs = require('fs'),
    path = require('path'),
    cli = require('./../../lib/cli'),
    hint = require('./../../lib/hint');

describe("cli", function () {
    beforeEach(function () {
        if (!process.stdout.flush) {
            process.stdout.flush = function () {};
        }

        spyOn(process, "exit");
        spyOn(hint, "hint").andReturn([]);
        spyOn(process.stdout, "write");
    });

    it("interprets --help with no args", function () {
        var txt = require('fs').readFileSync(__dirname + "/../../HELP", "utf-8");
        cli.interpret(["node", "hint"]);
        expect(process.stdout.write.mostRecentCall.args[0]).toEqual(txt);
    });

    it("interprets --help", function () {
        var txt = require('fs').readFileSync(__dirname + "/../../HELP", "utf-8");
        cli.interpret(["node", "hint", "file.js", "--help"]);
        expect(process.stdout.write.mostRecentCall.args[0]).toEqual(txt);
    });

    it("interprets --config", function () {
        var config = {};

        spyOn(fs, "readFileSync").andReturn("data");
        spyOn(path, "existsSync").andCallFake(function (path) {
            return path.match(/file\.json$/) ? true : false;
        });
        spyOn(JSON, "parse").andReturn(config);

        cli.interpret(["node", "hint", "file2.js", "file.js", "--config", "file.json"]);

        expect(fs.readFileSync).toHaveBeenCalledWith("file.json", "utf-8");
        expect(JSON.parse).toHaveBeenCalledWith("data");
        expect(hint.hint.mostRecentCall.args[0]).toContain("file.js");
        expect(hint.hint.mostRecentCall.args[0]).toContain("file2.js");
        expect(hint.hint.mostRecentCall.args[1]).toEqual(config);
    });

    it("interprets --reporter", function () {
        var reporter = require("./../../example/reporter").reporter;
        spyOn(process, "cwd").andReturn(__dirname + "/../");
        cli.interpret(["node", "hint", "file.js", "file.js", "--reporter", "../example/reporter.js"]);
        expect(hint.hint.mostRecentCall.args[2]).toEqual(reporter);
    });

    it("looks for a default config when no custom config is specified", function () {
        var config = {prefdef: []},
            path = require('path'),
            home = path.join(process.env.HOME, '.jshintrc');

        spyOn(path, "existsSync").andCallFake(function (path, encoding) {
            return path.match(home) ? true : false;
        });

        spyOn(fs, "readFileSync").andCallFake(function (path, encoding) {
            if (path === home) {
                return JSON.stringify(config);
            } else {
                throw "does not exist";
            }
        });

        cli.interpret(["node", "hint", "file.js", "file.js"]);
        expect(fs.readFileSync.argsForCall[0]).toEqual([home, "utf-8"]);
    });

    it("looks for a project specific config file", function () {
        var config = {prefdef: []},
            path = require('path');

        spyOn(fs, "readFileSync").andReturn(JSON.stringify(config));
        spyOn(path, "existsSync").andCallFake(function (path) {
            return path.match(/\.jshintrc/) ? true : false;
        });

        cli.interpret(["node", "hint", "file.js", "file2.js"]);

        expect(fs.readFileSync.argsForCall[0]).toEqual([path.join(process.env.HOME, '.jshintrc'), "utf-8"]);
        expect(fs.readFileSync.argsForCall[1]).toEqual([path.join(process.cwd(), '.jshintrc'), "utf-8"]);
    });

    it("overrides options from the $HOME .jshintrc file with options from the cwd .jshintrc file", function () {
        var config = '{"evil": true,"predef":["Monkeys","Elephants"]}',
            old_readFileSync = fs.readFileSync;

        spyOn(fs, "readFileSync").andCallFake(function (file, data, encoding) {
            if (file.match(path.resolve(".jshintrc"))) {
                return config;
            } else {
                return old_readFileSync(file, data, encoding);
            }
        });

        cli.interpret(["node", "hint", "file.js", "file2.js"]);

        expect(hint.hint.mostRecentCall.args[1].predef).toContain("Monkeys");
        expect(hint.hint.mostRecentCall.args[1].predef).toContain("Elephants");
        expect(hint.hint.mostRecentCall.args[1].evil).toEqual(true);
    });

    it("interprets --version and logs the current package version", function () {
        var data = {version: 1};
        spyOn(fs, "readFileSync").andReturn(JSON.stringify(data));
        cli.interpret(["node", "file.js", "--version"]);
        expect(process.stdout.write.mostRecentCall.args[0]).toEqual(data.version + "\n");
    });

    it("interprets --jslint-reporter and uses the jslint xml reporter", function () {
        var reporter = require("./../../lib/reporters/jslint_xml").reporter;
        cli.interpret(["node", "file.js", "file.js", "--jslint-reporter"]);
        expect(hint.hint.mostRecentCall.args[2]).toEqual(reporter);
    });

    it("interprets --show-non-errors and uses the non error reporter", function () {
        var reporter = require("./../../lib/reporters/non_error.js").reporter;
        cli.interpret(["node", "file.js", "file.js", "--show-non-errors"]);
        expect(hint.hint.mostRecentCall.args[2]).toEqual(reporter);
    });

    it("reads in a .jshintignore file if present in current working directory", function () {
        spyOn(path, "existsSync").andCallFake(function (path) {
            return path.match(/\.jshintignore/) ? true : false;
        });

        spyOn(fs, "readFileSync").andCallFake(function (file) {
            if (file.match(/\.jshintignore$/)) {
                return "dir\nfile.js\n";
            } else {
                throw "not found";
            }
        });

        cli.interpret(["node", "hint", "file.js"]);

        expect(hint.hint.mostRecentCall.args[3]).toEqual(["dir", "file.js"]);
    });

    it("exits the process with a successful status code with no lint errors", function () {
        var results = [];

        hint.hint.reset();
        hint.hint.andReturn(results);
        spyOn(process.stdout, "flush").andReturn(true);

        cli.interpret(["node", "hint", "file.js"]);

        expect(process.exit).toHaveBeenCalledWith(0);
    });

    it("exits the process with a failed status code when there are lint errors", function () {
        var results = [{}, {}];

        hint.hint.reset();
        hint.hint.andReturn(results);
        spyOn(process.stdout, "flush").andReturn(true);

        cli.interpret(["node", "hint", "file.js"]);

        expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("listens for sdtout drain event if not flushed", function () {
        var results = [{}, {}];

        hint.hint.reset();
        hint.hint.andReturn(results);
        spyOn(process.stdout, "flush").andReturn(false);
        spyOn(process.stdout, "on").andCallFake(function (name, func) {
            func();
        });

        cli.interpret(["node", "hint", "file.js"]);

        expect(process.stdout.on.argsForCall[0][0]).toBe("drain");
        expect(process.exit).toHaveBeenCalledWith(1);
    });
});
