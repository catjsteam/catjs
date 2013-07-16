var _fs = require('fs.extra'),
    _path = require('path'),
    _lineReader = require('line-reader'),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _mdata = catrequire("cat.mdata"),
    _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _props = catrequire("cat.props");

module.exports = function () {

    var _inject = function (scrap) {

            var file = scrap.get("file"),
                fileinfo = scrap.get("fileinfo"),
                commentinfo = scrap.get("commentinfo"),
                lines=[] , lineNumber = 1;


            if (file) {
                if (_fs.existsSync(file)) {

                    _lineReader.eachLine(file,function (line) {

                        if (lineNumber == commentinfo.end.line) {
                            line = [line.substring(0, commentinfo.end.col), " console.log('cat scrap: " + scrap.get("name") +"'); " ,line.substring(commentinfo.end.col, line.length)].join("");
                        }

                        lines.push(line + "\r\n");
                        // use 'return false' to stop this madness
                        lineNumber++;

                    }).then(function () {

                            _fs.writeFile(file, lines.join(""), function(err) {
                                if(err) {
                                    _utils.error(_props.get("cat.error").format("[cat mdata]", err));
                                } else {
                                    _log.debug(_props.get("cat.mdata.write").format("[cat mdata]"));
                                }
                            });

                        });
                }
            }

        },
        _init = function () {

            var data = _mdata.read(),
                dataobj = (data ? JSON.parse(data) : undefined),
                fileName, scrapName, files, scrapData, scrapDataObj,
                scrap, scraps = [];

            if (dataobj) {

                // TODO go over the updates for the file that was changed...

                files = dataobj.files;
                if (files) {
                    for (fileName in files) {
                        if (fileName) {
                            scrapDataObj = files[fileName];
                            if (scrapDataObj) {
                                for (scrapName in scrapDataObj) {
                                    scrapData = scrapDataObj[scrapName];
                                    if (scrapData) {
                                        scrap = new _Scrap.clazz(scrapData);
                                        if (scrap) {
                                            _inject(scrap);
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            }

        }, _apply = function () {

        }

    return {

        init: _init,

        apply: _apply
    };
}();