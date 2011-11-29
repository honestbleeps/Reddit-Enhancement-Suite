describe("file/directory walking performance", function () {
    var path = require('path');

    beforeEach(function checkGeneratedFS() {
        if (!path.existsSync(__dirname + "/.files")) {
            throw "no .files folder!";
        }
    });

    describe("by default", function () {
        it("performs reasonably", function () {
            var finished = false,
                time = new Date().getTime();

            require('child_process').exec(__dirname + "/../../bin/hint " + __dirname + "/.files", function (b) {
                if (b) {
                    process.stdout.write(b.message + "\n");
                    throw b;
                }

                var stamp =  new Date().getTime() - time;

                process.stdout.write("Took ~" + stamp + "ms\n");
                expect(stamp <= 6000).toBe(true); // usually ~5s

                finished = true;
            });

            waitsFor(function () {
                return finished;
            }, "time out", 10000);
        });
    });
});
