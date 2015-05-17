var common = require("./common.js");

common.init("./../..");
common.createCatProject({
    appath: "./../app-example",
    testname: "test-init",
    port: "8088",
    callback: function() {
        common.run({
            tasks: ["t@clean", "t@init", "t@scrap", "t@inject", "t@autotest", "t@server.start", "t@runner.start"],
            callback: function() {

            }
        });
    }
});
