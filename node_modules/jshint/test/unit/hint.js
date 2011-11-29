var fs = require('fs'),
    jshint = require('./../../packages/jshint/jshint.js'),
    hint = require('./../../lib/hint');

describe("hint", function () {
    function mockJSHINT(success, data) {
        spyOn(jshint, "JSHINT").andReturn(success);
        jshint.JSHINT.data = function () {
            return data;
        };
    }

    beforeEach(function () {
        spyOn(process.stdout, "write");
        spyOn(process, "exit");
    });

    it("returns an array of results", function () {
        var targets = ["file1.js"];

        mockJSHINT(true);
        spyOn(fs, "readFileSync").andReturn("data");
        spyOn(fs, "statSync").andReturn({
            isDirectory: jasmine.createSpy().andReturn(false)
        });

        expect(hint.hint(targets)).toEqual([]);
    });

    it("collects files", function () {
        var targets = ["file1.js", "file2.js", ".hidden"];

        mockJSHINT(true);
        spyOn(fs, "readFileSync").andReturn("data");

        spyOn(fs, "statSync").andReturn({
            isDirectory: jasmine.createSpy().andReturn(false)
        });

        hint.hint(targets);

        expect(fs.readFileSync.callCount).toEqual(2);
        expect(fs.readFileSync).not.toHaveBeenCalledWith(targets[2], "utf-8");
        expect(fs.readFileSync).toHaveBeenCalledWith(targets[0], "utf-8");
        expect(fs.readFileSync).toHaveBeenCalledWith(targets[1], "utf-8");
    });

    it("collects directory files", function () {
        var targets = ["dir", "file2.js"];

        mockJSHINT(true);

        spyOn(fs, "readFileSync").andReturn("data");
        spyOn(fs, "readdirSync").andReturn(["file2.js"]);

        spyOn(fs, "statSync").andCallFake(function (path) {
            return {
                isDirectory: function () {
                    return path === targets[0] ? true : false;
                }
            };
        });

        hint.hint(targets);

        expect(fs.readFileSync.callCount).toEqual(2);

        expect(fs.readFileSync.argsForCall[0])
            .toContain(require('path').join(targets[0], "file2.js"));

        expect(fs.readFileSync.argsForCall[0]).toContain("utf-8");

        expect(fs.readFileSync.argsForCall[1]).toContain(targets[1]);
        expect(fs.readFileSync.argsForCall[1]).toContain("utf-8");
    });

    it("passes custom config", function () {
        var targets = ["file1.js"],
            config = {};

        mockJSHINT(true);
        spyOn(fs, "readFileSync").andReturn("data");

        spyOn(fs, "statSync").andReturn({
            isDirectory: jasmine.createSpy().andReturn(false)
        });

        hint.hint(targets, config);

        expect(jshint.JSHINT).toHaveBeenCalledWith("data", config);
    });

    it("uses custom reporter", function () {
        var targets = ["file1.js"],
            config = null,
            reporter = jasmine.createSpy("reporter");

        mockJSHINT(true);
        spyOn(fs, "readFileSync").andReturn("data");

        spyOn(fs, "statSync").andReturn({
            isDirectory: jasmine.createSpy("isDirectory").andReturn(false)
        });

        hint.hint(targets, config, reporter);

        expect(reporter).toHaveBeenCalled();
    });

    it("ignores files", function () {
        var targets = ["file2.js", "file1.js", "foo"],
            ignore = ["file1.js", "foo"];

        spyOn(fs, "readFileSync").andReturn("data");

        spyOn(fs, "statSync").andCallFake(function (p) {
            return {
                isDirectory: function () {
                    return p === "foo" ? true : false;
                }
            };
        });

        hint.hint(targets, null, null, ignore);

        expect(fs.readFileSync.callCount).toBe(1);
        expect(fs.readFileSync.mostRecentCall.args[0]).toBe("file2.js");
    });

    it("ignores directories", function () {
        var targets = ["dir/file.js", "dir2/foo", "file0.js"],
            ignore = ["dir2/*"];

        spyOn(fs, "readFileSync").andReturn("data");

        spyOn(fs, "statSync").andCallFake(function (p) {
            return {
                isDirectory: function () {
                    return p === "dir2/foo" ? true : false;
                }
            };
        });

        hint.hint(targets, null, null, ignore);

        expect(fs.readFileSync.callCount).toBe(2);
        expect(fs.readFileSync.argsForCall[1][0]).toBe("file0.js");
        expect(fs.readFileSync.argsForCall[0][0]).toBe("dir/file.js");
    });

    it("performs a left side match when no back slashes present and is directory", function () {
        var targets = ["dir2.js", "dir2/foo/test.js", "dir/foo/test.js"],
            ignore = ["dir2"];

        spyOn(fs, "readFileSync").andReturn("data");

        spyOn(fs, "statSync").andCallFake(function (p) {
            return {
                isDirectory: function () {
                    return p === "dir2" ? true : false;
                }
            };
        });

        hint.hint(targets, null, null, ignore);

        expect(fs.readFileSync.callCount).toBe(1);
        expect(fs.readFileSync.argsForCall[0][0]).toBe("dir/foo/test.js");
    });

    // TODO: handles jshint errors (will tighten custom reporter assertions)
    // TODO: handles file open error
    // TODO: handling of JSHINT.data()
});
