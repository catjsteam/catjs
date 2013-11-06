require("../../src/module/CATCli.js").init();

var chai = require("./lib/chai.js"),
    _cat = require("./lib/cat.core.test.js"),
    _jshint = require("jshint").JSHINT;

_cat.utils.chai.test(chai);

var code = "assert.ok(false,'test');";
var validcode = _jshint(code, {
        "strict": false,
        "curly": true,
        "eqeqeq": true,
        "immed": false,
        "latedef": true,
        "newcap": false,
        "noarg": true,
        "sub": true,
        "undef": true,
        "boss": true,
        "eqnull": true,
        "node": true,
        "es5": false
    },
    { assert:true });

if (validcode) {
    _cat.utils.chai.assert({code: code, fail:true});
} else {
    console.log("The code is not valid: ", _jshint.errors);
}

