var args = process.argv.slice(2),
    build = require("./../testModule.js");

if (args && args.length > 0) {
    if (args[0] === "all") {
        build.test();
    }

} else {
    process.chdir("./../..");
    build.run("sencha");

}

