var common = require("./common.js");

common.init("./../..");

common.run({
    tasks: ["t@wipe", "t@init", "t@scrap", "t@inject", "t@autotest", "t@server.start", "t@runner.start"],
    callback: function () {

    }
});
    