require("../../src/module/CATCli.js").init();

var uglify = catrequire("cat.uglify.utils");

var code = uglify.walk({code:"console.log('asdsadas')"});

