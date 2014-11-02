var _fs = require("fs.extra"),
    _less = require("less"),
    _name = "cat",
    _parser = new(_less.Parser)({
        paths: [
           './css/less'
        ]
    }),
    content;

function _clean() {
    var path = "./css/" + _name +".css";
    if (_fs.existsSync(path)) {
        _fs.unlinkSync(path);
    }
}

function _generate() {
    _clean();

    content = require("fs").readFileSync('./css/less/app.less', "utf8");
    _parser.parse(content, function (e, model) {
        if (e) {
            console.error("error occured while parsing the content: ",e);
        }
        _fs.writeFileSync( "./css/" + _name +".css", model.toCSS({ compress: true }) );
    });
}

_generate();