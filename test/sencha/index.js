require("./../../src/module/CATCli.js").init({
    init: "cat",
    schema: {
        properties: {
            name: "sencha-test",
            host: "localhost",
            port: "8089",
            protocol: "http",
            appath: "./../cat-test-app"
        }
    },
    callback: function() {

        process.nextTick(function() {
            if (require("fs").existsSync('./cat-project')) {
                process.chdir('./cat-project');
                require("./../../src/module/CATCli.js").init({
                    task:["t@init", "t@scrap", "t@inject", "t@autotest", "t@server.start", "t@runner.start"]
                });
            }

        });
    }
});