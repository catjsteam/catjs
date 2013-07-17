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

    var _mdobject,

        _generateSourceProject = function(file) {
            var filepath = ((_mdobject.project && _mdobject.project.basepath) ? _utils.getRelativePath(file, _mdobject.project.basepath) : undefined),
                workpath = _global.get("home").working.path,
                targetfile, targetfolder;
            if (filepath) {
                targetfile = _path.normalize([workpath, "src", filepath].join("/"));
                targetfolder = _path.dirname(targetfile);
                if (targetfolder)  {
                    if (!_fs.existsSync(targetfolder)) {
                        _utils.mkdirSync(targetfolder);
                    }
                }
                if (_fs.existsSync(targetfile)) {
                    _log.debug(_props.get("cat.source.project.file.exists").format("[inject ext]", targetfile));
                }
                _fs.writeFile(targetfile, " /** test */", function (err) {
                    if (err) {
                        _utils.error(_props.get("cat.error").format("[inject ext]", err));
                    } else {
                        _log.debug(_props.get("cat.source.project.file.create").format("[inject ext]", targetfile));
                    }
                });

            }

        },
        _injectScrapCall = function (scrap, file, commentinfo) {

            var lines = [] , lineNumber = 1;

            _lineReader.eachLine(file,function (line) {

                if (lineNumber == commentinfo.end.line) {
                    line = [line.substring(0, commentinfo.end.col), " console.log('cat scrap: " + scrap.get("name") + "'); " , line.substring(commentinfo.end.col, line.length)].join("");
                }
                lines.push(line + "\n");

                // use 'return false' to stop this madness
                lineNumber++;

            }).then(function () {

                    _fs.writeFile(file, lines.join(""), function (err) {
                        if (err) {
                            _utils.error(_props.get("cat.error").format("[inject ext]", err));
                        } else {
                            _log.debug(_props.get("cat.mdata.write").format("[inject ext]"));
                        }
                    });

                });

        },

        _inject = function (scrap) {

            var file = scrap.get("file"),
                scrapinfo = scrap.get("scrapinfo"),
                commentinfo = scrap.get("commentinfo");


            if (file) {
                if (_fs.existsSync(file)) {
                    _injectScrapCall(scrap, file, commentinfo);
                    _generateSourceProject(file);
                }

            }
        },
        _init = function () {

            var data = _mdata.read(),
                fileName, scrapName, files, scrapData, scrapDataObj,
                scrap, scraps = [];

            _mdobject = (data ? JSON.parse(data) : undefined);
            if (_mdobject) {

                // TODO go over the updates for the file that was changed...

                files = _mdobject.files;
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