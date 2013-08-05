var _fs = require('fs.extra'),
    _path = require('path'),
    _lineReader = require('line-reader'),
    _global = catrequire("cat.global"),
    _log = _global.log(),
    _mdata = catrequire("cat.mdata"),
    _Scrap = catrequire("cat.common.scrap"),
    _utils = catrequire("cat.utils"),
    _tplutils = catrequire("cat.tpl.utils"),
    _props = catrequire("cat.props"),
    _basePlugin = require("./../Base.js"),
    _project = catrequire("cat.project"),
    _beautify = require('js-beautify').js_beautify;


/**
 * Injection extension for CAT
 *
 * @type {module.exports}
 */
module.exports = _basePlugin.ext(function () {

    var _me = this,
        _mdobject,

        /**
         * Generate CAT source test project files according to the metadata
         *
         * @param scraps The scraps data
         * @param fileName The reference file to be processed
         */
            _generateSourceProject = function (scraps, file) {

            function _generateFileContent(scraps) {

                var output = [];

                scraps.forEach(function (scrap) {
                    scrap.apply(scrap);
                });

                scraps.forEach(function (scrap) {
                    output.push(_tplutils.template({
                            name: "scrap/_func",
                            data: {name: scrap.get("name"), output: scrap.generate()}
                        }
                    ));
                });

                return output.join("");

            }

            function copyResources(projectInfo) {

                var tplPath = projectInfo.templates,
                    srcFolder = projectInfo.srcFolder,
                    tplSrcFile = _path.normalize([tplPath, "Cat.js"].join("/")),
                    tplTargetFile = _path.normalize([srcFolder, "Cat.js"].join("/")),
                    mdata;

//                try {
//                    _utils.copySync(tplSrcFile, tplTargetFile);
//                    _mdata.update({project: {resources: [tplTargetFile]}});
//
//                } catch (e) {
//                    _log.error(_props.get("cat.file.copy.failed").format("[cat config]", tplFile, e));
//                }

            }

            var filepath = ((_mdobject.project && _mdobject.project.basepath) ? _utils.getRelativePath(file, _mdobject.project.basepath) : undefined),
                projectInfo,
                targetfile, targetfolder, fileContent;

            projectInfo = _project.getInfo();
            if (!projectInfo) {
                _log.warning(_props.get(""))
            }


            if (projectInfo) {

                // copy resources
                copyResources(projectInfo);

                targetfile = _path.normalize([projectInfo.srcFolder, filepath].join("/"));
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
                    fileContent = _beautify(fileContent, { indent_size: 2 });
                    try {
                        _fs.writeFileSync(targetfile, fileContent);
                        _log.debug(_props.get("cat.source.project.file.create").format("[inject ext]", targetfile));
                    } catch (e) {
                        _utils.error(_props.get("cat.error").format("[inject ext]", e));
                    }
                }
            }

        },

        /**
         * Inject CAT calls to the proper location according to the scraps data
         *
         * @param scraps The scraps data
         * @param file The reference file to be processed
         */
            _injectScrapCall = function (scraps, file) {

            var lines = [] , lineNumber = 1,
                commentinfos = [];

            function _injectCodeByScrap(line) {

                /*
                 *  In case there are more than one scrap per comment we need to store the
                 *  Info for all the scrap related to that comment.
                 */
                var prevCommentInfo,
                    size = commentinfos.length,
                    counter = 0;

                commentinfos.forEach(function (info) {

                    var content,
                        scraplcl = info.scrap,
                        injectinfo = scraplcl.get("injectinfo");

                    function removeOldCall() {
                        var startpos, endpos;

                        if (injectinfo && injectinfo.start) {
                            startpos = [injectinfo.start.line, injectinfo.start.col];
                            endpos = [injectinfo.end.line, injectinfo.end.col];

                            if (lineNumber == startpos[0]) {
                                line = [line.substring(0, startpos[1]), line.substring(endpos[1])].join("");
                            }
                        }
                    }


                    if (lineNumber == info.line) {

                        // we need to reevaluate the injected calls
                        if (injectinfo) {
                            removeOldCall();
                        }
                        //content = "console.log('cat scrap: " + scraplcl.get("name") + "'); ";
                        content = _tplutils.template({
                                name: "scrap/_cat_call",
                                data: {param1:["{ scrap:", JSON.stringify(scraplcl.serialize()), "}"].join("")}
                            }
                        );
                        content = (_utils.prepareCode(content) || "");
                        if (prevCommentInfo) {
                            line = [line.substring(0, prevCommentInfo.end.col), content , line.substring(prevCommentInfo.end.col, line.length)].join("");
                        } else {
                            line = [line.substring(0, info.col), content , line.substring(info.col, line.length)].join("");
                        }

                        /*
                         *  In case we already injected content related to that comment.
                         *  We can get more than one scrap per comment.
                         *  Get the last injected call info.
                         */
                        if (prevCommentInfo) {
                            prevCommentInfo = {start: {line: lineNumber, col: prevCommentInfo.end.col}, end: {line: lineNumber, col: (prevCommentInfo.end.col + content.length)}};
                        } else {
                            prevCommentInfo = {start: {line: lineNumber, col: info.col}, end: {line: lineNumber, col: (info.col + content.length)}};
                        }
                        scraplcl.set("injectinfo", prevCommentInfo);
                    }

                    counter++;
                });

                return line;
            }

            // get scrap info
            scraps.forEach(function (scrap) {
                var commentinfo = scrap.get("commentinfo");
                if (commentinfo) {
                    commentinfos.push({col: commentinfo.end.col, line: commentinfo.end.line, scrap: scrap});
                }
            });

            _lineReader.eachLine(file, function (line) {

                line = _injectCodeByScrap(line);
                lines.push(line + "\n");

                // use 'return false' to stop this madness
                lineNumber++;

            }).then(function () {

                    _Scrap.apply({scraps: scraps});

                    try {
                        _fs.writeFileSync(file, lines.join(""));
                        _log.debug(_props.get("cat.mdata.write").format("[inject ext]"));

                    } catch (e) {
                        _utils.error(_props.get("cat.error").format("[inject ext]", e));
                    }

                });

        },

        /**
         * Generate CAT test project and create the proper functionality according to the scraps
         * Injects the proper calls according to the scraps
         *
         * @param scraps The scraps data
         * @param fileName The reference file to be processed
         */
            _inject = function (scraps, fileName) {

            var file = fileName;

            if (file) {
                if (_fs.existsSync(file)) {

                    _injectScrapCall(scraps, file);

                    _generateSourceProject(scraps, file);
                }

            }
        },

        _module = {

            /**
             * Plugin initialization
             * Reads the data out of CAT metadata file
             * Go over the files and inject the data according to the metadata information
             */
            init: function (config, ext) {
                _me.initialize(config, ext);

            },

            /**
             * Apply sync changes coming from the watch.
             *
             * @param config
             */
            watch: function (config) {
                console.log("inject");

                var emitter = _me.getEmitter();

                emitter.emit("job.done", {status: "done"});
            },

            /**
             * Empty apply method for the inject extension
             *
             */
            apply: function (config) {

                var data,
                    fileName, scrapName,
                    files, scrapData, scrapDataObj,
                    scrap, scraps = [],
                    emitter = _me.getEmitter();

                _me.apply(config);

                data = (_mdata ? _mdata.read() : undefined);
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

                emitter.emit("job.done", {status: "done"});
            }
        };

    return _module;
});