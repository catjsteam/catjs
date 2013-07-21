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

        _generateSourceProject = function (scraps, file) {

            function _generateFileContent(scraps) {

                var output = [];

                scraps.forEach(function (scrap) {
                    if (scrap) {
                        output.push("function " + scrap.get("name") + "() {");
                        output.push("       /* test content in here */");
                        output.push("}");
                    }
                });

                return output.join("");

            }

            var filepath = ((_mdobject.project && _mdobject.project.basepath) ? _utils.getRelativePath(file, _mdobject.project.basepath) : undefined),
                workpath = _global.get("home").working.path,
                targetfile, targetfolder, fileContent;

            if (filepath) {
                targetfile = _path.normalize([workpath, "src", filepath].join("/"));
                targetfolder = _path.dirname(targetfile);
                if (targetfolder) {
                    if (!_fs.existsSync(targetfolder)) {
                        _utils.mkdirSync(targetfolder);
                    }
                }
                if (_fs.existsSync(targetfile)) {
                    _log.debug(_props.get("cat.source.project.file.exists").format("[inject ext]", targetfile));
                }

                fileContent = _generateFileContent(scraps);
                if (fileContent) {
                    _fs.writeFile(targetfile, fileContent, function (err) {
                        if (err) {
                            _utils.error(_props.get("cat.error").format("[inject ext]", err));
                        } else {
                            _log.debug(_props.get("cat.source.project.file.create").format("[inject ext]", targetfile));
                        }
                    });
                }
            }

        },

        _injectScrapCall = function (scraps, file) {

            var lines = [] , lineNumber = 1,
                commentinfos = [];

            function _injectCodeByScrap(line) {

                commentinfos.forEach(function (info) {
                    var content;
                    if (lineNumber == info.line) {
                        content = "console.log('cat scrap: " + info.scrap.get("name") + "'); ";
                        line = [line.substring(0, info.col), "console.log('cat scrap: " + info.scrap.get("name") + "'); " , line.substring(info.col, line.length)].join("");
                        info.scrap.set("injectinfo", {start:{line: lineNumber, col:info.col}, end:{line: lineNumber, col: (info.col + content.length)}});
                    }

                });
                return line;

            }

            // get scrap info
            scraps.forEach(function (scrap) {
                var commentinfo = scrap.get("commentinfo");
                if (commentinfo) {
                    commentinfos.push({col: commentinfo.end.col, line: commentinfo.end.line,scrap: scrap});
                }
            });

            _lineReader.eachLine(file,function (line) {

                line = _injectCodeByScrap(line);
                lines.push(line + "\n");

                // use 'return false' to stop this madness
                lineNumber++;

            }).then(function () {

                    _Scrap.apply({scraps: scraps});

                    _fs.writeFile(file, lines.join(""), function (err) {
                        if (err) {
                            _utils.error(_props.get("cat.error").format("[inject ext]", err));
                        } else {
                            _log.debug(_props.get("cat.mdata.write").format("[inject ext]"));
                        }
                    });

                });

        },

        _inject = function (scraps, fileName) {

            var file = fileName;

            if (file) {
                if (_fs.existsSync(file)) {

                    _injectScrapCall(scraps, file);

                    _generateSourceProject(scraps, file);
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
                        scraps = [];
                        if (fileName) {

                            scrapDataObj = files[fileName];
                            if (scrapDataObj) {
                                for (scrapName in scrapDataObj) {
                                    scrapData = scrapDataObj[scrapName];
                                    if (scrapData) {
                                        scrap = new _Scrap.clazz(scrapData);
                                        if (scrap) {
                                            scraps.push(scrap);
                                        }
                                    }
                                }
                            }
                            _inject(scraps, fileName);
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